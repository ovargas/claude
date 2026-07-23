import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const MANIFEST = join(ROOT, '.codex-plugin', 'plugin.json');
const SKILLS = join(ROOT, 'skills');
const COMMANDS = join(ROOT, 'commands');

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  expect(match, 'missing YAML frontmatter').not.toBeNull();

  return Object.fromEntries(
    match![1]
      .split('\n')
      .map(line => line.match(/^([^:]+):\s*(.*)$/))
      .filter((entry): entry is RegExpMatchArray => entry !== null)
      .map(entry => [entry[1].trim(), entry[2].trim()])
  );
}

describe('Codex plugin manifest', () => {
  it('is present and points to the Codex workflow adapters', () => {
    expect(existsSync(MANIFEST)).toBe(true);
    const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

    expect(manifest.name).toBe('virtual-team');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(manifest.skills).toBe('./skills/');
    expect(manifest.author?.name).toBeTruthy();
    expect(manifest.interface?.displayName).toBe('Virtual Team');
    expect(manifest.hooks).toBeUndefined();
  });
});

describe('Codex workflow adapters', () => {
  const commands = readdirSync(COMMANDS)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));

  it.each(commands)('%s has a matching Codex Skill adapter', command => {
    const skillPath = join(SKILLS, `workflow-${command}`, 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);

    const content = readFileSync(skillPath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    expect(frontmatter.name).toBe(`workflow-${command}`);
    expect(frontmatter.description).toBeTruthy();
    expect(content).toContain(`../../commands/${command}.md`);
    expect(content).toContain('../codex-host-adaptation.md');
  });

  it('contains no orphan adapters', () => {
    const adapters = readdirSync(SKILLS)
      .filter(entry => entry.startsWith('workflow-') && statSync(join(SKILLS, entry)).isDirectory())
      .map(entry => entry.replace(/^workflow-/, ''));
    expect(adapters.sort()).toEqual(commands.sort());
  });
});
