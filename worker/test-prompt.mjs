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
    'December 2026', 'FULL-TIME, PAID, SALARIED',
  ]],
];

// Text that must NOT appear: a visa category he does not hold, and banned figures.
const MUST_NOT = [
  // ⚠️ Do NOT test for the word "uptime" here. The BAN LINE contains it legitimately, so a
  //    naive absence check fails on a correctly configured file. Test the ban's presence
  //    (MUST, above) instead; that is the thing that actually protects him.
  ['cloud profile', CLOUD, ['STEM OPT', 'F-1', 'H-1B', 'sole developer of', 'seasoned']],
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

// ⛔ NO FIRST-PERSON PRONOUNS ABOUT YASH. The voice was first person until 2026-10-19 and this
//    test asserted the exact opposite; it is flipped deliberately, not by accident. The reason
//    for third person is that a recruiter pastes answers into Slack and ATS notes where the "AI
//    assistant" label does not travel, and a first-person excerpt reads as his own words. The
//    model recites instruction text as readily as fact text, so every pronoun it can READ has to
//    already be third person. Lines about the ASSISTANT itself ("I don't have that detail") are
//    allowed, and listed explicitly.
const ALLOWED_1P = [
  "i don't have that detail",   // the assistant speaking about itself
  'never "i" or "my"',          // the rule that forbids first person must quote it
  'never "i", "my" or "me"',
];
for (const [name, hay] of [['cloud profile', CLOUD]]) {
  const lines = hay.split('\n').filter((l) => {
    const low = l.toLowerCase();
    if (ALLOWED_1P.some((a) => low.includes(a))) return false;
    return /\b(I|my|me|myself)\b/.test(l);
  });
  for (const l of lines) { console.error(`FIRST PERSON in ${name}: "${l.trim().slice(0, 90)}"`); bad++; }
}

// ⛔ No em dashes anywhere a model can copy them from. Models mirror source punctuation, and the
//    style rule alone does not survive contact with an em dash in the facts.
for (const [name, hay] of [['cloud profile', CLOUD]]) {
  const n = (hay.match(/—/g) || []).length;
  if (n) { console.error(`EM DASH x${n} in ${name}`); bad++; }
}

if (bad) { console.error(`\n${bad} problem(s). Do not deploy.`); process.exit(1); }
console.log(`OK. cloud fact base ~${Math.round(CLOUD.length / 4)} tokens.`);
