#!/usr/bin/env node
// Scrub profanity and mature themes from word/sentence lists.
//
//   node scripts/scrub-content.mjs --report
//   node scripts/scrub-content.mjs --apply-words
//   node scripts/scrub-content.mjs --flag-sentences <out.json>
//   node scripts/scrub-content.mjs --apply-rewrites <in.json>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LANG_DIR = path.join(ROOT, 'src/assets/languages');
const PROF_DIR = path.join(__dirname, 'data/profanity');

// Words obscenity flags that we explicitly allow.
const EN_ALLOWLIST = new Set(['hell', 'damn', 'stupid', 'hate', 'screw', 'screwed']);

// Per-language false positives — words flagged by their LDNOOBW list that
// have a dominant innocent meaning in everyday use, or are mild enough to
// align with our English allowlist (hell/damn/stupid/hate/crap-not).
const ALLOWLIST_BY_LANG = {
  english_american: EN_ALLOWLIST,
  english_british: EN_ALLOWLIST,
  english_200: EN_ALLOWLIST,

  dutch: new Set([
    'balen',    // bales / to be unhappy (mild)
    'beurt',    // turn (innocent)
    'gat',      // hole
    'hol',      // hollow / lair
    'kont',     // butt (mild, like English "butt")
    'muts',     // hat / cap
    'naaien',   // to sew
    'nicht',    // cousin / niece
    'paal',     // pole
    'poot',     // paw / leg
    'pot',      // pot
    'rukken',   // to pull / jerk (mostly innocent)
    'spuiten',  // to spray / inject
    'wippen',   // to seesaw
    'zuigen',   // to suck (vacuum etc.)
  ]),

  french: new Set([
    'jouir',    // to enjoy (slang sense exists but innocent dominant)
    'baiser',   // a kiss (noun); verb form is vulgar
    'gueule',   // mouth / face (mild slang, like "mug")
  ]),

  italian: new Set([
    'battere',    // to hit / strike
    'cadavere',   // corpse (literal medical term)
    'pesce',      // fish
    'regina',     // queen
    'sbattere',   // to slam
    'tirare',     // to pull
    'cacca',      // poo (mild, kid word)
    'imbecille',  // imbecile (mild, like "stupid")
    'montare',    // to mount / assemble
    'pompa',      // pump
    'porco',      // pig
    'vacca',      // cow
  ]),

  portuguese: new Set([
    'amador',   // amateur
    'aranha',   // spider
    'burro',    // donkey
    'cerveja',  // beer
    'comer',    // to eat (slang sense exists but eating dominant)
    'corno',    // horn (animal)
    'gozar',    // to enjoy
    'inferno',  // hell (allowed per English policy)
    'pau',      // stick / wood
    'saco',     // bag / sack
  ]),

  spanish: new Set([
    'asno',      // donkey
    'concha',    // shell (vulgar in some Latin American Spanish, innocent in EU Spanish)
    'caca',      // poo (mild)
    'idiota',    // mild like "stupid"
    'imbécil',   // mild like "stupid"
    'infierno',  // hell
    'maldito',   // damn
    'martillo',  // hammer
    'orina',     // urine (medical)
    'pedo',      // fart (mild, kid word)
    'pis',       // pee (mild, kid word)
    'pinche',    // kitchen helper / "damn" (mild)
    'esperma',   // sperm (medical)
    'semen',     // semen (medical)
    'pezón',     // nipple (anatomical)
    'vulva',     // (anatomical)
    'nazi',      // historical / political term
  ]),

  russian: new Set([
    'бугор',  // hill / bump
  ]),

  hungarian: new Set([
    'marha',  // cattle / cow (literal innocent)
  ]),

  indonesian: new Set([
    'anjing',  // literal "dog" dominant in word lists
    'bodoh',   // stupid (allowed per policy)
  ]),

  japanese: new Set([
    '女の子',   // girl
    '嫌い',    // dislike
    'いたずら', // mischief / prank
    '支配',    // rule / control
    '人種',    // race (ethnicity)
  ]),
};

// English mature-themes block list (applied on top of obscenity).
const EN_MATURE = [
  'kill', 'kills', 'killed', 'killing', 'killer', 'killers',
  'murder', 'murders', 'murdered', 'murdering', 'murderer',
  'slaughter', 'massacre',
  'dead', 'death', 'deaths', 'die', 'dying', 'died', 'dies',
  'corpse', 'corpses',
  'sex', 'sexy', 'sexual', 'sexually', 'sexes',
  'naked', 'nude', 'porn', 'pornography', 'pornographic',
  'drug', 'drugs', 'drugged', 'cocaine', 'heroin', 'marijuana', 'meth', 'addict',
  'drunk', 'drunken', 'alcoholic', 'alcohol',
  'crap', 'crappy',
  'suicide', 'suicidal',
];

// `obscenity: true` enables substring/transformer matching — English only.
const LANG_CONFIG = {
  english_american:  { ldnoobw: ['en'],      mature: EN_MATURE, obscenity: true,  hasSentences: true,  isCJK: false },
  english_british:   { ldnoobw: ['en'],      mature: EN_MATURE, obscenity: true,  hasSentences: true,  isCJK: false },
  english_200:       { ldnoobw: ['en'],      mature: EN_MATURE, obscenity: true,  hasSentences: false, isCJK: false },
  programming:       { ldnoobw: [],          mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  arabic:            { ldnoobw: ['ar'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  catalan:           { ldnoobw: ['ca'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  chinese:           { ldnoobw: ['zh'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: true  },
  dutch:             { ldnoobw: ['nl'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  french:            { ldnoobw: ['fr'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  german:            { ldnoobw: ['de'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  hindi:             { ldnoobw: ['hi'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  hungarian:         { ldnoobw: ['hu'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  indonesian:        { ldnoobw: ['id'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  italian:           { ldnoobw: ['it'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  japanese:          { ldnoobw: ['ja'],      mature: [],        obscenity: false, hasSentences: false, isCJK: true  },
  korean:            { ldnoobw: ['ko'],      mature: [],        obscenity: false, hasSentences: false, isCJK: true  },
  portuguese:        { ldnoobw: ['pt'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  romanian:          { ldnoobw: ['ro'],      mature: [],        obscenity: false, hasSentences: false, isCJK: false },
  russian:           { ldnoobw: ['ru'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  spanish:           { ldnoobw: ['es'],      mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
  uyghur:            { ldnoobw: [],          mature: [],        obscenity: false, hasSentences: true,  isCJK: false },
};

const ENGLISH_MATCHER = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

function loadLdnoobw(code) {
  const file = path.join(PROF_DIR, `${code}.txt`);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

function buildLangChecker(name, cfg) {
  const ldnoobwTerms = new Set();
  for (const code of cfg.ldnoobw) {
    for (const t of loadLdnoobw(code)) ldnoobwTerms.add(t.toLowerCase());
  }
  const matureTerms = new Set(cfg.mature.map(w => w.toLowerCase()));
  const useObscenity = !!cfg.obscenity;
  const allowlist = new Set(
    [...(ALLOWLIST_BY_LANG[name] ?? new Set())].map(w => w.toLowerCase()),
  );

  // Word-list check: exact match (case-insensitive).
  const checkWord = (word) => {
    const lower = word.toLowerCase();
    if (allowlist.has(lower)) return [];
    const reasons = [];
    if (ldnoobwTerms.has(lower)) reasons.push('profanity');
    if (matureTerms.has(lower)) reasons.push('mature');
    if (useObscenity && ENGLISH_MATCHER.hasMatch(lower)) {
      if (!reasons.includes('profanity')) reasons.push('profanity');
    }
    return reasons;
  };

  // Sentence check: find which terms hit. CJK uses substring; others word-boundary regex.
  const buildPattern = (terms) => {
    if (cfg.isCJK) {
      return terms.map(t => ({ term: t, re: new RegExp(escapeRe(t), 'i') }));
    }
    return terms.map(t => ({
      term: t,
      re: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(t)}(?![\\p{L}\\p{N}_])`, 'iu'),
    }));
  };
  const ldnoobwPatterns = buildPattern([...ldnoobwTerms]);
  const maturePatterns = buildPattern([...matureTerms]);

  const checkSentence = (sentence) => {
    const hits = [];
    for (const { term, re } of ldnoobwPatterns) {
      if (allowlist.has(term)) continue;
      if (re.test(sentence)) hits.push({ term, kind: 'profanity' });
    }
    for (const { term, re } of maturePatterns) {
      if (allowlist.has(term)) continue;
      if (re.test(sentence)) hits.push({ term, kind: 'mature' });
    }
    if (useObscenity) {
      const matches = ENGLISH_MATCHER.getAllMatches(sentence, true);
      for (const m of matches) {
        const meta = englishDataset.getPayloadWithPhraseMetadata(m).phraseMetadata;
        const word = meta?.originalWord;
        if (word && !allowlist.has(word.toLowerCase())) {
          if (!hits.some(h => h.term === word)) hits.push({ term: word, kind: 'profanity' });
        }
      }
    }
    return hits;
  };

  return { checkWord, checkSentence };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split('\n');
}

function writeLines(file, lines) {
  fs.writeFileSync(file, lines.join('\n'));
}

function reportLanguage(name, cfg) {
  const dir = path.join(LANG_DIR, name);
  const wordsFile = path.join(dir, 'words.txt');
  const sentencesFile = path.join(dir, 'sentences.txt');
  const checker = buildLangChecker(name, cfg);

  const flaggedWords = [];
  if (fs.existsSync(wordsFile)) {
    const lines = readLines(wordsFile);
    for (const line of lines) {
      const w = line.trim();
      if (!w) continue;
      const reasons = checker.checkWord(w);
      if (reasons.length) flaggedWords.push({ word: w, reasons });
    }
  }

  const flaggedSentences = [];
  if (cfg.hasSentences && fs.existsSync(sentencesFile)) {
    const lines = readLines(sentencesFile);
    lines.forEach((line, idx) => {
      const s = line.trim();
      if (!s) return;
      const hits = checker.checkSentence(s);
      if (hits.length) flaggedSentences.push({ lineNumber: idx + 1, sentence: s, hits });
    });
  }

  return { flaggedWords, flaggedSentences };
}

function applyWordRemovals(name, cfg) {
  const file = path.join(LANG_DIR, name, 'words.txt');
  if (!fs.existsSync(file)) return 0;
  const checker = buildLangChecker(name, cfg);
  const lines = readLines(file);
  const kept = [];
  let removed = 0;
  for (const line of lines) {
    const w = line.trim();
    if (w && checker.checkWord(w).length) {
      removed++;
      continue;
    }
    kept.push(line);
  }
  writeLines(file, kept);
  return removed;
}

function flagAllSentences(outFile) {
  const all = [];
  for (const [name, cfg] of Object.entries(LANG_CONFIG)) {
    if (!cfg.hasSentences) continue;
    const { flaggedSentences } = reportLanguage(name, cfg);
    for (const fs of flaggedSentences) {
      all.push({ language: name, ...fs });
    }
  }
  fs.writeFileSync(outFile, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} flagged sentences to ${outFile}`);
}

function applyRewrites(inFile) {
  const rewrites = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  // Group by language.
  const byLang = {};
  for (const r of rewrites) {
    (byLang[r.language] ??= []).push(r);
  }
  for (const [lang, items] of Object.entries(byLang)) {
    const file = path.join(LANG_DIR, lang, 'sentences.txt');
    const lines = readLines(file);
    let dropped = 0, replaced = 0;
    // Apply highest line numbers first to preserve indices when removing.
    items.sort((a, b) => b.lineNumber - a.lineNumber);
    for (const item of items) {
      const idx = item.lineNumber - 1;
      if (item.action === 'drop') {
        lines.splice(idx, 1);
        dropped++;
      } else if (item.action === 'replace' && typeof item.replacement === 'string') {
        lines[idx] = item.replacement;
        replaced++;
      }
    }
    writeLines(file, lines);
    console.log(`  ${lang}: replaced=${replaced} dropped=${dropped}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === '--report') {
    let totalWords = 0, totalSentences = 0;
    for (const [name, cfg] of Object.entries(LANG_CONFIG)) {
      const { flaggedWords, flaggedSentences } = reportLanguage(name, cfg);
      if (!flaggedWords.length && !flaggedSentences.length) continue;
      console.log(`\n=== ${name} ===`);
      if (flaggedWords.length) {
        console.log(`  Words to remove (${flaggedWords.length}):`);
        for (const fw of flaggedWords) {
          console.log(`    - ${fw.word}  [${fw.reasons.join(', ')}]`);
        }
      }
      if (flaggedSentences.length) {
        console.log(`  Sentences to rewrite (${flaggedSentences.length}):`);
        for (const fs of flaggedSentences.slice(0, 5)) {
          const terms = fs.hits.map(h => `${h.term}(${h.kind})`).join(', ');
          console.log(`    L${fs.lineNumber}: ${terms}`);
        }
        if (flaggedSentences.length > 5) {
          console.log(`    ... and ${flaggedSentences.length - 5} more`);
        }
      }
      totalWords += flaggedWords.length;
      totalSentences += flaggedSentences.length;
    }
    console.log(`\nTotal: ${totalWords} words, ${totalSentences} sentences`);
    return;
  }

  if (cmd === '--apply-words') {
    let total = 0;
    for (const [name, cfg] of Object.entries(LANG_CONFIG)) {
      const removed = applyWordRemovals(name, cfg);
      if (removed) console.log(`  ${name}: removed ${removed}`);
      total += removed;
    }
    console.log(`Removed ${total} words total.`);
    return;
  }

  if (cmd === '--flag-sentences') {
    const out = args[1];
    if (!out) { console.error('--flag-sentences requires output path'); process.exit(1); }
    flagAllSentences(out);
    return;
  }

  if (cmd === '--apply-rewrites') {
    const inFile = args[1];
    if (!inFile) { console.error('--apply-rewrites requires input path'); process.exit(1); }
    applyRewrites(inFile);
    return;
  }

  console.error(`Usage:
  --report
  --apply-words
  --flag-sentences <out.json>
  --apply-rewrites <in.json>`);
  process.exit(1);
}

main();
