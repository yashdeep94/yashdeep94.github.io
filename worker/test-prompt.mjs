// 🚨 THIS EXISTS BECAUSE A RULE LANDED IN THE WRONG PLACE AND NOBODY NOTICED.
//
// The ban list ("sole developer", MCP, Cursor, CI/CD on the Eisai entry) was written carefully
// as `//` comments ABOVE `export const PROFILE = \``. Comments are not in the template literal,
// so NO MODEL EVER SAW THEM. Verified 2026-10-19: PROFILE.includes('sole developer') was false
// while the file read, to a human, as though the rule was enforced. A recruiter agent asked
// "who else worked on LISA?" and the configuration had nothing to stop an implied
// sole-authorship claim, which is the single highest-stakes claim on the page.
//
// A rule written in the wrong place is not a rule. This asserts the text actually reaches the
// model. Run it before every deploy:  node worker/test-prompt.mjs

import { PROFILE, SITUATION } from './src/profile.js';
import { LOCAL_SYSTEM } from '../src/data/localProfile.js';
import { readFileSync } from 'node:fs';

const CLOUD = PROFILE + '\n' + SITUATION;

// Each entry: [haystack name, text, phrases that MUST be present]
const MUST = [
  ['cloud profile', CLOUD, [
    'sole developer', 'MCP', 'Cursor', 'GitHub Actions',
    'yashdevdarekar94@gmail.com',
    // Docker is REAL (Eisai Posit + the homeserver Compose stack) and its absence from this file
    // is what made the assistant invent "Docker from my coursework" under pressure and then
    // defend it for three turns. Assert the term AND its scope.
    'Docker', 'Posit',
    // An explicit NOT-IN-BACKGROUND list. Absence alone does not stop a model bridging; it has to
    // be told the answer is no.
    'NOT IN MY BACKGROUND', 'Airflow', 'Snowflake',
    'COURSEWORK OR SMALL PROJECTS',
  ]],
  ['on-device profile', LOCAL_SYSTEM, [
    'sole developer', 'MCP', 'yashdevdarekar94@gmail.com',
  ]],
];

// Text that must NOT appear: a visa category he does not hold, and banned figures.
const MUST_NOT = [
  // ⚠️ Do NOT test for the word "uptime" here. The BAN LINE contains it legitimately, so a
  //    naive absence check fails on a correctly configured file. Test the ban's presence
  //    (MUST, above) instead; that is the thing that actually protects him.
  ['cloud profile', CLOUD, ['STEM OPT', 'F-1', 'H-1B', 'sole developer of']],
  ['on-device profile', LOCAL_SYSTEM, ['STEM OPT', 'F-1', 'H-1B']],
];

let bad = 0;
for (const [name, hay, phrases] of MUST) {
  for (const p of phrases) {
    if (!hay.includes(p)) { console.error(`MISSING  ${name}: "${p}"`); bad++; }
  }
}
for (const [name, hay, phrases] of MUST_NOT) {
  for (const p of phrases) {
    if (hay.includes(p)) { console.error(`PRESENT but must not be  ${name}: "${p}"`); bad++; }
  }
}

// ⛔ NO THIRD-PERSON PRONOUNS. The assistant speaks AS him, and it recites instruction text as
//    readily as fact text: 15 of 45 live answers mixed "I" and "he", including "...how I managed
//    the integrity of the LISA retrieval layer, you can reach him at ...". Every pronoun the
//    model can read must already be first person. Two question strings are quoted deliberately
//    (they are what a VISITOR types) and are allowed.
// Lines that legitimately name Yash in the third person: they define who the ASSISTANT is in
// relation to him, and are never restated as a fact about himself. Everything else must be "I".
const ALLOWED_3P = [
  'where is he weakest', 'how good is he at', 'what is he still learning',
  "yash darekar's portfolio", 'assistant yash built', 'in his first-person voice',
  'even when the visitor says',   // the rule that FORBIDS third person must quote it to forbid it
];
for (const [name, hay] of [['cloud profile', CLOUD], ['on-device profile', LOCAL_SYSTEM]]) {
  const lines = hay.split('\n').filter((l) => {
    const low = l.toLowerCase();
    if (ALLOWED_3P.some((a) => low.includes(a))) return false;
    return /\b(he|him|his)\b/i.test(l);
  });
  for (const l of lines) { console.error(`THIRD PERSON in ${name}: "${l.trim().slice(0, 90)}"`); bad++; }
}

// ⛔ No em dashes anywhere a model can copy them from. Models mirror source punctuation, and the
//    style rule alone does not survive contact with an em dash in the facts.
for (const [name, hay] of [['cloud profile', CLOUD], ['on-device profile', LOCAL_SYSTEM]]) {
  const n = (hay.match(/—/g) || []).length;
  if (n) { console.error(`EM DASH x${n} in ${name}`); bad++; }
}

// ── On-device window arithmetic. ⛔ Do not replace this with a magic number for the prompt size:
//    the thing that actually matters is whether the SYSTEM PROMPT plus the MAXIMUM HISTORY the
//    widget will send still fits, and those are two constants in two different files. Assert the
//    relationship, so changing either one is caught by the other.
//      window      4096  (Llama-3.2-1B-Instruct-q4f16)
//      a turn      ~280  (~30 question + ~250 answer)
//      reserved     400  (max_tokens for the answer in flight)
const LOCAL_WINDOW = 4096;
const TURN_TOKENS = 280;
const RESERVED_OUT = 400;

const widget = readFileSync(new URL('../src/components/AskYash.jsx', import.meta.url), 'utf8');
const mt = widget.match(/LOCAL_MAX_TURNS\s*=\s*(\d+)/);
if (!mt) { console.error('cannot find LOCAL_MAX_TURNS in AskYash.jsx'); bad++; }
const maxTurns = mt ? Number(mt[1]) : 0;

const localTok = Math.round(LOCAL_SYSTEM.length / 4);
const needed = localTok + maxTurns * TURN_TOKENS + RESERVED_OUT;
if (needed > LOCAL_WINDOW) {
  console.error(
    `on-device overflows its window: system ${localTok} + ${maxTurns} turns x ${TURN_TOKENS} ` +
    `+ ${RESERVED_OUT} reserved = ${needed}, over ${LOCAL_WINDOW}. ` +
    `Shorten LOCAL_SYSTEM or lower LOCAL_MAX_TURNS in AskYash.jsx.`);
  bad++;
}

if (bad) { console.error(`\n${bad} problem(s). Do not deploy.`); process.exit(1); }
console.log(`OK. cloud ~${Math.round(CLOUD.length / 4)} tok. on-device ~${localTok} tok + ` +
  `${maxTurns} turns = ${needed} of ${LOCAL_WINDOW}.`);
