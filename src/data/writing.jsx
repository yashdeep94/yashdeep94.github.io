// Long-form write-ups. Structure follows brandur.org/idempotency-keys: frame the problem,
// name the simpler option and why it was not taken, the running example, the design, the
// failures enumerated, and the limits admitted.
// ⛔ EVERY NUMBER HERE COMES FROM cloud/docs/ IN THE PRIVATE REPO. Verify before publishing.
export const writing = [
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
          'The honest baseline was to not migrate. Keep everything at home, put Cloudflare in front of it for DNS and CDN, drop the static IP, and save about ₹1,950 a year with no rewrite at all. Today the hosting cost is almost entirely that static IP.',
          'So the cloud move does not pay for itself. It buys availability and it buys me a serverless system I have actually operated rather than read about. I decided that was worth it, and I think stating that plainly is more useful than inventing a cost argument that the measurements do not support.',
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
