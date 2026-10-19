// The fact base the assistant is allowed to speak from.
//
// ⛔ EVERY LINE HERE IS VERIFIED. It is transcribed from RESUME_CONTENT.md in the job-application
//    pipeline repo, which is the provenance ledger: a claim with no entry there is treated as
//    invented. Do not add a fact to this file to make an answer sound better. A recruiter who
//    probes an invented claim in an interview finds a candidate who overstated, which is worse
//    than the gap the claim was covering.
//
// ⛔ THINGS THAT ARE TRUE BUT MUST NOT BE CLAIMED HERE, each for a recorded reason:
//    · testing / CI-CD / GitHub Actions / Docker / microservices on the Eisai entry — not evidenced
//    · MCP — LISA's tools are REGISTERED, which is a different thing
//    · "sole developer", "solely built", "only contributor" — he was not
//    · uptime / latency / throughput / scalability figures — none are measured
//    · Cursor — never used it

export const PROFILE = `
# Yash Darekar

Boston, MA. MS Information Systems at Northeastern University, graduating December 2026.
GPA 3.73. Open to Cloud, Backend, Full Stack, AI/ML and Forward-Deployed engineering roles.
Email yashdevdarekar94@gmail.com · linkedin.com/in/yashdarekar · github.com/yashdeep94

## Application Cloud Engineer, Co-op — Eisai Inc., Cambridge MA (Jan 2026 – Aug 2026)
Team: Scientific Application Support.

- Designed and deployed LISA (Lab IT Support Agent), a GenAI assistant IN PRODUCTION at the
  Cambridge site, helping scientists troubleshoot lab instrument and device issues. Full stack:
  Databricks Apps for frontend and backend, a LangGraph agent orchestrating Claude through
  Databricks Model Serving, FastAPI backend, Pydantic V2 for typed state, and Lakebase (Postgres)
  for chat history. The Databricks workspace runs on AWS.
- Built the retrieval layer: ingested device manuals and metadata from Databricks Volumes into
  14 core Delta tables, then chunked and indexed 317 manuals with multilingual embeddings and
  Vector Search, exposed to the agent as a tool. The multilingual part matters — it answers
  accurately across non-English manuals.
- Implemented a human-in-the-loop feedback loop: admin-approved corrections are written back into
  Vector Search so recurring issues get better answers over time. Also built a continuous
  SharePoint to Databricks sync so updated metadata ingests with no manual step.
- Registered 17 tools for the agent including Unity Catalog functions, log-writing queries and a
  DuckDuckGo web-search tool. Built an operational dashboard for usage and performance visibility,
  with alerting. Wired SQL Warehouse, Volumes and Jobs as Databricks app resources.
- Gathered requirements directly from the scientists who use it.
- Prototyped GPU-bound Imaris imaging software on an AWS EC2 g4dn instance instead of local
  workstations, validating cloud GPU scaling as a workstation alternative.
- Ran large-scale scientific data transfers with rclone: parallelised NAS to S3, S3 to S3 and
  GCP to AWS migrations, with checksum and log verification reports to guarantee integrity. He was
  the team's only GCP-capable engineer.
- Supported an SDDC to AWS-native migration with written test documentation, Posit upgrade sandbox
  testing plus how-to guides for scientists, and an RNA-seq pipeline proof of concept on Databricks
  compute. Managed the team's ServiceNow queue.
- On the Daisy project, shadowed scientists to map and document manual data-movement workflows and
  designed Starfish-based automation to replace them (requirements and design phase).

## Freelance Developer (Dec 2021 – Sep 2022)
Built and shipped billing and recharge systems for small business owners.
- Gathered requirements directly from each business owner.
- Integrated government e-waybill APIs, GPay/UPI payments and automated email notifications into
  the billing and recharge systems the owners ran on, replacing their manual processing.

## Homeserver (personal infrastructure, ongoing)
A Django codebase he runs himself on bare metal. Prometheus, Grafana, Loki and nginx, with
alerting. 18 test modules run in CI. This is where his monitoring and observability experience
comes from — NOT from the Eisai work.

## Coursework (Fall 2026, Northeastern)
AWS CDK, FastAPI microservices, DynamoDB and Java backend work, with measured p95/p99 latency from
a failure-injection exercise. Data Science Engineering Methods (INFO 6105), Program Structures and
Algorithms (INFO 6205), and a cloud microservices deployment project.

## Technologies
Languages: Python, JavaScript, TypeScript, Java, C++, Kotlin, R, SQL, Bash
Frontend: React, Jetpack Compose, Material UI, Tailwind, vanilla JS
Backend: Django, Flask, FastAPI, Node.js, Express, REST APIs, Celery, Redis
Data & AI: Databricks, Delta Lake, Vector Search, LangGraph, Pydantic, pandas, PyTorch basics
Cloud & infra: AWS (EC2, S3, CDK), GCP, DigitalOcean, bare metal, Terraform, Prometheus,
Grafana, Loki, nginx, rclone, Git
`.trim();

// What he is looking for. Used to answer "is he a fit" honestly and concretely.
export const SITUATION = `
- Graduates December 2026 and can start February 2027.
- Authorised to work in the US on STEM OPT. He WILL need visa sponsorship in the future.
  If a recruiter asks about work authorisation, answer exactly that — do not hedge, do not
  volunteer immigration detail beyond it, and never guess at dates or categories.
- Based in Boston, open to relocation.
- Strongest fit: roles where someone has to build the thing AND talk to the people using it —
  forward-deployed engineering, applied AI, platform and cloud work. LISA is the proof: he
  gathered the requirements from scientists himself and shipped the system they use.
`.trim();
