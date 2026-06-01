#!/usr/bin/env bun
/**
 * Scan project text for emoji missing TTS spoken replacements.
 * Usage: bun run scripts/audit-emoji-tts.ts
 */

import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EMOJI_SEQUENCE_RE,
  findUnmappedEmojis,
  knownEmojiSpeechKeys,
} from '@/audio/speech-emoji-substitutions';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src', 'public/content', 'plan'];
const SKIP_FILES = new Set(['src/audio/speech-emoji-substitutions.ts']);
const EXT = /\.(ts|tsx|json|md|mdx)$/;

type EmojiHit = { emoji: string; files: Set<string>; count: number };

function walk(dir: string, onFile: (path: string) => void) {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'dist') {
      continue;
    }
    const path = join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(path, onFile);
    } else if (EXT.test(ent.name)) {
      onFile(path);
    }
  }
}

function collectEmojiUsage(): Map<string, EmojiHit> {
  const usage = new Map<string, EmojiHit>();

  for (const scanDir of SCAN_DIRS) {
    walk(join(ROOT, scanDir), (filePath) => {
      const rel = relative(ROOT, filePath);
      if (SKIP_FILES.has(rel)) return;
      const text = readFileSync(filePath, 'utf8');
      for (const match of text.matchAll(EMOJI_SEQUENCE_RE)) {
        const emoji = match[0];
        const hit = usage.get(emoji) ?? { emoji, files: new Set<string>(), count: 0 };
        hit.count += 1;
        hit.files.add(rel);
        usage.set(emoji, hit);
      }
    });
  }

  return usage;
}

function main() {
  const usage = collectEmojiUsage();
  const unmapped: EmojiHit[] = [];
  const mapped: EmojiHit[] = [];

  for (const hit of usage.values()) {
    if (findUnmappedEmojis(hit.emoji).length > 0) {
      unmapped.push(hit);
    } else {
      mapped.push(hit);
    }
  }

  unmapped.sort((a, b) => b.count - a.count);
  mapped.sort((a, b) => a.emoji.localeCompare(b.emoji));

  console.log(`Known TTS emoji replacements: ${knownEmojiSpeechKeys().length}`);
  console.log(`Unique emoji in scanned text: ${usage.size}`);
  console.log(`Mapped: ${mapped.length} · Unmapped: ${unmapped.length}\n`);

  if (unmapped.length > 0) {
    console.log('Unmapped emoji (add to src/audio/speech-emoji-substitutions.ts):\n');
    for (const hit of unmapped) {
      const codepoints = [...hit.emoji]
        .map((ch) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase()}`)
        .join(' ');
      console.log(`  ${hit.emoji}  (${codepoints})  ×${hit.count}`);
      for (const file of [...hit.files].slice(0, 3)) {
        console.log(`      ${file}`);
      }
      if (hit.files.size > 3) {
        console.log(`      … +${hit.files.size - 3} more`);
      }
    }
    console.log('');
    process.exit(1);
  }

  console.log('All emoji in scanned content have spoken replacements.');
}

main();
