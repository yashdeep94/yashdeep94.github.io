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

const CLOUD = PROFILE + '\n' + SITUATION;

// Each entry: [haystack name, text, phrases that MUST be present]
const MUST = [
  ['cloud profile', CLOUD, [
    'sole developer', 'MCP', 'Cursor', 'GitHub Actions', 'Docker',
    'yashdevdarekar94@gmail.com', 'two tiers',
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

// ⛔ No em dashes anywhere a model can copy them from. Models mirror source punctuation, and the
//    style rule alone does not survive contact with an em dash in the facts.
for (const [name, hay] of [['cloud profile', CLOUD], ['on-device profile', LOCAL_SYSTEM]]) {
  const n = (hay.match(/—/g) || []).length;
  if (n) { console.error(`EM DASH x${n} in ${name}`); bad++; }
}

// On-device runs a 4,096-token context, and what the system prompt spends is taken from the
// conversation. The budget below is derived, not guessed:
//   4096 window - 1300 system - 400 reserved for the answer = 2396 for history
//   a turn is ~30 (question) + ~250 (answer) = ~280 tokens  ->  about 8 turns
// AskYash.jsx caps local history to LOCAL_MAX_TURNS so overflow cannot happen even if a visitor
// keeps going. Raising this number without re-deriving it is how the window silently overflows.
const LOCAL_BUDGET = 1300;
const localTok = LOCAL_SYSTEM.length / 4;
if (localTok > LOCAL_BUDGET) {
  console.error(`on-device prompt ~${Math.round(localTok)} tokens, over the ${LOCAL_BUDGET} budget`);
  bad++;
}

if (bad) { console.error(`\n${bad} problem(s). Do not deploy.`); process.exit(1); }
console.log(`OK. cloud ~${Math.round(CLOUD.length / 4)} tokens, on-device ~${Math.round(localTok)} tokens.`);
