// Diagram definitions, kept out of the components so a write-up can reference one by key.
// ⛔ Nothing here names a workspace, catalog, schema, app URL or ticket. LISA is internal
//    enterprise work; its own description file requires that boundary and it is kept.
export const diagrams = {
  moneyPath: {
    nodes: [
      { label: 'Customer', sub: 'CloudFront' },
      { label: 'public-api', sub: 'Rust / Lambda' },
      { label: 'DynamoDB', sub: 'txn + outbox' },
      { label: 'relay', sub: 'Rust' },
      { label: 'SQS FIFO', sub: 'per login' },
      { label: 'worker', sub: 'Playwright' },
    ],
    steps: [
      { node: 0, title: 'A customer pays',
        body: 'A request arrives at CloudFront. Nothing has been charged and nothing has been written.' },
      { node: 1, title: 'The API does not move money',
        body: 'A Rust service on Lambda validates the request. It has no side effects of its own: everything that matters happens in the next step, as one write.' },
      { node: 2, title: 'One transactional write',
        body: 'The business rows, an outbox record and an idempotency key go into DynamoDB in a single transaction. A retry carrying the same key finds it already there and does nothing. At this point the payment is recorded but has still not been sent anywhere, and if everything downstream failed now the record would survive.' },
      { node: 3, title: 'The stream is the truth, the queue is a doorbell',
        body: 'A Rust relay reads the DynamoDB Stream. The queue that comes next is only a notification; the database stays the source of truth, and an outbox sweeper catches any doorbell that was lost.' },
      { node: 4, title: 'One lane per provider login',
        body: 'The relay enqueues on SQS FIFO with the message group set to the provider login. That keeps one money job per login in flight, which is a constraint of the upstream portal rather than of this system.' },
      { node: 5, title: 'The worker claims, it does not trust',
        body: 'The worker claims the job with a conditional update before acting. A redelivered message loses the claim and is routed through the same check used for ambiguous outcomes, so it cannot charge twice. The outcome is written back in one transaction, and what cannot be resolved lands in a dead-letter queue rather than disappearing.' },
    ],
  },

  trustBoundary: {
    nodes: [
      { label: 'Scientist', sub: 'asks' },
      { label: 'Agent loop', sub: 'LangGraph' },
      { label: 'Backend', sub: 'owns the call' },
      { label: 'Governed fn', sub: 'access control' },
      { label: 'Audit', sub: 'every write' },
    ],
    steps: [
      { node: 0, title: 'A question about a lab instrument',
        body: 'The people using this are scientists and IT support staff, not engineers. They ask in the words they actually use, in two languages.' },
      { node: 1, title: 'The model chooses, it does not reach',
        body: 'The agent loop decides which tool is needed. That is the whole of its authority: it names a tool and its arguments, and it stops there.' },
      { node: 2, title: 'The backend owns every call',
        body: 'The rule the whole design rests on is that the model never touches enterprise data directly. The backend makes every call on its behalf, which is what makes each read permissioned and each write auditable rather than taking the model at its word.' },
      { node: 3, title: 'Only governed functions are reachable',
        body: 'The tools are governed functions with access control attached, not raw queries. In a regulated environment the question is never only what the answer is, it is who was allowed to ask and what they were allowed to change.' },
      { node: 4, title: 'Writes leave a record',
        body: 'Every write sits behind a preview, an explicit confirmation and an audit table. The point is not that the model is untrustworthy. It is that an operational system has to answer what happened and who did it, regardless of what the model got right.' },
    ],
  },
};
