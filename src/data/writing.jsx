// Long-form write-ups. Structure follows brandur.org/idempotency-keys: frame the problem,
// name the simpler option and why it was not taken, the running example, the design, the
// failures enumerated, and the limits admitted.
// ⛔ EVERY NUMBER HERE COMES FROM cloud/docs/ IN THE PRIVATE REPO. Verify before publishing.
export const writing = [
  {
    slug: 'agent-decisions',
    title: 'Six decisions in a production agent, and the one I got wrong',
    date: 'November 2026',
    summary:
      'An AI support agent for lab equipment in a regulated environment. The architecture is my employer\'s; the decisions are mine, and the decisions are the interesting half anyway.',
    sections: [
      {
        h: 'What it had to be',
        p: [
          'At a pharmaceutical company I built an agent that answers lab instrument and device questions for scientists and IT support staff. It was an idea when I started and a production system eight months later: a LangGraph loop calling Claude, retrieval over 300+ device manuals, and governed SQL functions as tools.',
          'This is internal enterprise work, so what follows deliberately contains no workspace, catalog, schema or URL. That is less of a loss than it sounds. A chatbot answers questions; an operational system also has to decide who may change the data underneath it, what happens when an answer is wrong, and how content from the internet is kept out of a trusted corpus. Those are decisions, not architecture, and they travel.',
        ],
      },
      {
        h: 'One: the model never touches the data',
        diagram: 'trustBoundary',
        p: [
          'The rule the whole design rests on. The model names a tool and its arguments and stops there; the backend makes every call on its behalf. That is what makes a read permissioned and a write auditable, rather than taking the model at its word and hoping.',
        ],
      },
      {
        h: 'Two: human-in-the-loop as a primitive, not a prompt',
        p: [
          'Asking a model to check with the user before doing something is a convention it may skip. So the pause is a tool. Calling it suspends the turn and returns a structured request, which the front end renders as real controls, and the answer comes back as state rather than as another sentence in the conversation.',
          'The difference matters when the question is "may I change this record". A convention that usually holds is not a control.',
        ],
      },
      {
        h: 'Three: the hardest one, and it looked easy',
        p: [
          'The upstream source of device metadata was a human-maintained workbook. Admins also needed to fix data in the app. Two-way sync is the obvious answer and it is the wrong one: it creates source-of-truth ambiguity, and with it conflict resolution and locking, for a problem that does not require either.',
          'Ingest is one-way. Admin edits live in an overrides layer that is re-applied after every rebuild of the ingested data. Both paths coexist and neither silently clobbers the other. It took longer to decide than to build.',
        ],
      },
      {
        h: 'Four: when an answer is wrong',
        p: [
          'Every turn is instrumented with spans. An admin panel takes a reported bad answer, reads that turn\'s recorded trace, shows each reasoning step and tool call, and generates an explanation of what went wrong. It then emits a ready-to-run correction for a person to apply.',
          'It does not apply the correction, and it does not re-run the turn. Diagnosis and action are separate on purpose, because the thing being diagnosed is the same kind of system doing the diagnosing.',
          'I kept both the raw trace and the generated explanation. The trace is exact and unreadable to anyone who is not an ML engineer; the explanation is readable and can itself be wrong. Dropping either one makes the panel worse for somebody.',
        ],
      },
      {
        h: 'Five: content from the internet is guilty until promoted',
        p: [
          'Manuals acquired automatically do not enter the trusted corpus. They stage as non-searchable and become retrievable only after a person promotes them. In a regulated setting the provenance of an answer is part of the answer.',
        ],
      },
      {
        h: 'Six: the one I got wrong',
        p: [
          'I did not commit a dependency lockfile. Builds re-resolved from open version ranges at deploy time, so when a transitive dependency published a breaking major release, it took the service down. Twice, in different packages.',
          'The second time I traced it to the exact symbol removed from the published wheel, and found that rolling back the code did not help, because redeploying an older commit re-resolved to the same broken version. That is the part worth carrying: reproducible builds are not hygiene, they are an availability requirement, and I learned it the expensive way rather than the cheap one.',
        ],
      },
      {
        h: 'What I will not claim',
        p: [
          'It reached production about a month before my co-op ended, and it was a proof of concept for most of the time before that. I supported it in production, answered questions from the people using it, and handed it over with documentation. That is a handover, not a track record.',
          'I have no adoption numbers and will not estimate any. New internal tools take time to reach people, and mine had not yet.',
          'And I was not the only person who worked on this. Every commit in the repository is mine, which is not the same claim.',
        ],
      },
    ],
  },

  {
    slug: 'serverless-rebuild',
    title: 'Moving a live business onto serverless AWS, and the case for not doing it',
    date: 'November 2026',
    summary:
      'I measured the system first, found that the cheapest option was to not migrate at all, and migrated anyway. This is what the numbers said and what I did with them.',
    sections: [
      {
        h: 'The system',
        p: [
          'A cable and internet operator runs on software I wrote and still operate. Staff recharge customer connections, raise bills, track inventory and chase renewals; customers look up what they owe and pay it. It had run for years on Django and MySQL, first on a cheap VPS and then on a Linux server I host myself.',
          'In November 2026 I spent a week studying what it would take to move it to AWS. The study was read-only: no code and no infrastructure changed while I did it.',
        ],
      },
      {
        h: 'What the measurements said',
        p: [
          'Seven days of Grafana, plus the code. About 19,000 HTTP requests a week on the cable app and 8,000 on the transport app. 120 MB served a week. A 14 MB database. Roughly 1,300 inserts and 1,400 updates a day.',
          'Two numbers were worth the week on their own. Around 300,000 queries a day, of which about 70% was one worker polling a jobs table. And roughly 190 million rows read a day, almost all of it from three unindexed queries.',
          'Neither of those is a reason to move to the cloud. Both are a reason to add three indexes and make one worker event-driven. I wrote that down before I wrote anything about Lambda.',
        ],
      },
      {
        h: 'The option I should have taken',
        p: [
          'The honest baseline was to not migrate. Keep everything at home, put Cloudflare in front of it for DNS and CDN, drop the static IP, and save about ₹1,950 a year, roughly $19, with no rewrite at all. Today the hosting cost is almost entirely that static IP.',
          'The whole design had to live inside always-free tiers, because any always-on paid product breaks a budget this size by itself. So the cloud move does not pay for itself. It buys availability and it buys me a serverless system I have actually operated rather than read about. I decided that was worth it, and I think stating that plainly is more useful than inventing a cost argument that the measurements do not support.',
        ],
      },
      {
        h: 'The design I recommended, and the one I built',
        p: [
          'The study recommended keeping Django whole, running it as a single Lambda behind the AWS Lambda Web Adapter, and putting Postgres on a managed free tier. Least change, least risk, and the existing test suite keeps working.',
          'I built something closer to the design the same document called a 16 to 30 person-week rewrite: Rust services on Lambda, DynamoDB instead of Postgres, keys derived from the list of every read and write the app makes rather than from the entities.',
          'Two things changed my mind. I did not want a third-party database company in the path of a business that bills people. And because the home server keeps running throughout, a parallel rebuild does not put the business at risk the way an in-place migration would, which is what made the larger option affordable in the first place.',
        ],
      },
      {
        h: 'Money, and the part that is actually hard',
        diagram: 'moneyPath',
        p: [
          'Recharges are the only place where a mistake is expensive, because the money leaves before the record is written. A business row, an outbox record and an idempotency key are written in one transaction, so a retried request cannot charge a customer twice.',
          'Jobs reach the worker through DynamoDB Streams into a relay, then SQS FIFO with the message group set to the provider login. That keeps one money job per login in flight at a time, which is a property of the upstream portal rather than of my system. Dead-letter queues catch the rest, and every consumer records a message id before it acts.',
          'The failure I spent the most time on is SQS redelivering a money job that already ran. A queue is a doorbell, not the truth: the worker claims a job with a conditional update, and a redelivered job is routed through the same check the system already used for ambiguous outcomes.',
        ],
      },
      {
        h: 'What I will not claim',
        p: [
          'The cost estimate is an estimate. It holds only if the background syncs stay off headless Chromium; if they do not, the same design costs roughly twenty times more and leaves the budget. That is the single most important number in the whole study and it is a forecast, not a measurement.',
          'I have no uptime figure. The system went live this month and the home server is still the fallback, so anyone who tells you three weeks of production is a track record is selling something.',
          'And I have not proved the rewrite was correct, only that it runs. The old system has 1,235 tests against years of real behaviour. The new one has its own, and they are not the same thing.',
        ],
      },
    ],
  },
];
