import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.git']);
const SCANNED_EXTENSIONS = ['.md', '.json'];

// Written as an escape, never as the literal character: this file is scanned
// by its own test.
const REPLACEMENT_CHAR = '\uFFFD';

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (SCANNED_EXTENSIONS.some(ext => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Report the byte offset of the first invalid UTF-8 sequence, or null if the
 * whole buffer decodes cleanly.
 *
 * readFileSync(file, 'utf-8') silently rewrites bad bytes to U+FFFD, so it
 * cannot detect corruption — a fatal TextDecoder throws instead. Feeding bytes
 * one at a time in stream mode pins the failure to an exact offset: a
 * multi-byte sequence split across chunks is buffered rather than reported as
 * an error, so the first throw is real corruption and not a chunk boundary.
 */
function findInvalidUtf8Offset(buffer: Buffer): number | null {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  for (let i = 0; i < buffer.length; i++) {
    try {
      decoder.decode(buffer.subarray(i, i + 1), { stream: true });
    } catch {
      return i;
    }
  }
  try {
    // Flush: a sequence left incomplete at EOF is corruption too.
    decoder.decode(new Uint8Array(0));
  } catch {
    return buffer.length - 1;
  }
  return null;
}

function lineNumberAt(buffer: Buffer, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < buffer.length; i++) {
    if (buffer[i] === 0x0a) line++;
  }
  return line;
}

const relativeFiles = collectSourceFiles(ROOT).map(f => f.replace(ROOT + '/', ''));

describe('source file encoding', () => {
  it('finds files to scan', () => {
    expect(relativeFiles.length).toBeGreaterThan(0);
  });

  it.each(relativeFiles)('%s decodes as valid UTF-8', (relativePath) => {
    const buffer = readFileSync(join(ROOT, relativePath));
    const offset = findInvalidUtf8Offset(buffer);
    expect(
      offset,
      offset === null
        ? ''
        : `${relativePath} has an invalid UTF-8 byte (0x${buffer[offset].toString(16)}) ` +
          `at byte ${offset}, line ${lineNumberAt(buffer, offset)}`
    ).toBe(null);
  });

  // U+FFFD means corruption already survived a decode-and-resave cycle: the
  // original byte is gone and the file now decodes "cleanly" as mojibake.
  it.each(relativeFiles)('%s has no U+FFFD replacement character', (relativePath) => {
    const buffer = readFileSync(join(ROOT, relativePath));
    // Raw-byte corruption also decodes to U+FFFD; the test above already names
    // it with a byte offset, so stay quiet here and avoid a duplicate failure.
    if (findInvalidUtf8Offset(buffer) !== null) return;

    const content = buffer.toString('utf-8');
    const index = content.indexOf(REPLACEMENT_CHAR);
    expect(
      index,
      index === -1
        ? ''
        : `${relativePath} contains a U+FFFD replacement character at offset ${index}`
    ).toBe(-1);
  });
});
