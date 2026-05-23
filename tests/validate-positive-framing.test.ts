import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');

const SKILL_DIR = join(ROOT, 'skills', 'positive-framing');
const SKILL_FILE = join(SKILL_DIR, 'SKILL.md');
const CATALOG_FILE = join(SKILL_DIR, 'references', 'pattern-catalog.md');
const TENSE_FILE = join(SKILL_DIR, 'references', 'tense-by-section.md');
const PROPOSAL_FILE = join(ROOT, 'commands', 'proposal.md');

describe('positive-framing skill — existence and structure', () => {
  it('SKILL.md exists', () => {
    expect(existsSync(SKILL_FILE)).toBe(true);
  });

  it('pattern-catalog.md exists', () => {
    expect(existsSync(CATALOG_FILE)).toBe(true);
  });

  it('tense-by-section.md exists', () => {
    expect(existsSync(TENSE_FILE)).toBe(true);
  });

  it('SKILL.md is at most 100 lines (ADR-001 size budget)', () => {
    const lines = readFileSync(SKILL_FILE, 'utf-8').split('\n').length;
    expect(lines).toBeLessThanOrEqual(100);
  });
});

describe('positive-framing skill — Voice Profile vs pattern cross-check', () => {
  // Parse the four Voice Profiles' forbidden-word lists from commands/proposal.md.
  // The forbidden words appear as a single line per profile:
  //   **Words to avoid:** *word1, word2, ...*
  // The profile is the immediately preceding `### \`--target-role=NAME\`` heading.
  function parseForbiddenByProfile(content: string): Record<string, string[]> {
    const byProfile: Record<string, string[]> = {};
    const headingPattern = /^### `--target-role=([a-z]+)`/;
    const avoidPattern = /\*\*Words to avoid:\*\*\s*\*?([^*\n]+)\*?/;

    let currentProfile: string | null = null;
    for (const line of content.split('\n')) {
      const heading = line.match(headingPattern);
      if (heading) {
        currentProfile = heading[1];
        continue;
      }
      if (currentProfile && avoidPattern.test(line)) {
        const raw = line.match(avoidPattern)![1];
        // Take words/phrases that look like normal lexical items; ignore
        // descriptive sentence fragments by keeping only comma-separated
        // tokens of <= 3 words.
        const tokens = raw
          .split(',')
          .map(t => t.trim().toLowerCase().replace(/[*"'.()]/g, '').trim())
          .filter(t => t.length > 0 && t.split(/\s+/).length <= 3)
          .filter(t => !t.includes(':'));
        byProfile[currentProfile] = tokens;
        currentProfile = null;
      }
    }
    return byProfile;
  }

  // Parse the catalog's table rows. Each row is:
  //   | loss-framed | gain-framed | notes |
  // We extract the gain-framed cell as the candidate replacement, and inspect
  // the notes cell for `skip-for: <profile>` tags.
  function parsePatterns(content: string): { replacement: string; skipFor: Set<string> }[] {
    const patterns: { replacement: string; skipFor: Set<string> }[] = [];
    for (const line of content.split('\n')) {
      if (!line.startsWith('|')) continue;
      const cells = line.split('|').map(c => c.trim());
      // Expect: ['', loss, gain, notes, '']
      if (cells.length < 4) continue;
      const replacement = cells[2];
      const notes = cells[3] ?? '';
      // Skip header and separator rows
      if (!replacement || /^[-: ]+$/.test(replacement)) continue;
      if (replacement.toLowerCase() === 'gain-framed') continue;

      const skipFor = new Set<string>();
      const skipMatches = notes.matchAll(/skip-for:\s*([a-z]+)/g);
      for (const m of skipMatches) skipFor.add(m[1]);

      patterns.push({ replacement: replacement.toLowerCase(), skipFor });
    }
    return patterns;
  }

  const forbiddenByProfile = parseForbiddenByProfile(readFileSync(PROPOSAL_FILE, 'utf-8'));
  const patterns = parsePatterns(readFileSync(CATALOG_FILE, 'utf-8'));

  it('parses all four Voice Profiles', () => {
    expect(Object.keys(forbiddenByProfile).sort()).toEqual(['cfo', 'client', 'cto', 'po']);
  });

  it('parses at least 20 catalog patterns', () => {
    expect(patterns.length).toBeGreaterThanOrEqual(20);
  });

  it('no catalog replacement contains a word forbidden by its target profile (unless tagged skip-for)', () => {
    const violations: string[] = [];

    for (const [profile, forbidden] of Object.entries(forbiddenByProfile)) {
      for (const { replacement, skipFor } of patterns) {
        if (skipFor.has(profile)) continue;
        for (const word of forbidden) {
          // Match whole-word occurrence
          const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (re.test(replacement)) {
            violations.push(`profile=${profile} forbidden="${word}" replacement="${replacement}"`);
          }
        }
      }
    }

    expect(
      violations,
      `Catalog replacements collide with Voice Profile forbidden words:\n${violations.join('\n')}`
    ).toEqual([]);
  });
});
