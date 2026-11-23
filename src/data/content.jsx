// ===== PERSONAL INFO =====
export const personalInfo = {
  name: "Yash Darekar",
  roles: [
    "AI Platform Engineer",
    "Backend Engineer",
    "Cloud Infrastructure",
  ],
  bio: "I build and run production systems. At Eisai I took a GenAI agent from an idea to production in eight months; two small businesses run on software I build and operate, re-architected this year onto serverless AWS in Rust. MS Information Systems at Northeastern, graduating December 2026.",
  email: "yashdevdarekar94@gmail.com",
  location: "Boston, MA",
  linkedin: "https://linkedin.com/in/yashdarekar",
  github: "https://github.com/yashdeep94",
};

// ===== WORK =====
// One line per employer, nelhage.com style. Every claim here is in claims.csv.
export const work = [
  {
    org: "Eisai Inc.",
    role: "Application Cloud Engineer, Co-op",
    when: "Jan \u2013 Aug 2026",
    where: "Cambridge, MA",
    line: "Took LISA from an idea to a production agentic system on Databricks: a LangGraph loop calling Claude across 17 registered tools, with MLflow tracing behind an admin panel that root-causes a reported answer.",
  },
  {
    org: "Yashdeep Cable Network \u00b7 SS Transline",
    role: "Software Engineer",
    when: "Dec 2021 \u2013 Present",
    where: "Remote",
    line: "Build and operate the software two small businesses run on, a cable-operator recharge system and a freight billing platform, each replacing paper ledgers.",
  },
];

// ===== FEATURED =====
// One project gets a paragraph; the rest get one line. Nobody puts the full list on a homepage.
export const featured = {
  title: "Re-architecting a live business onto serverless AWS",
  stack: ["Rust", "AWS Lambda", "DynamoDB", "SQS FIFO", "CloudFront", "Terraform"],
  body: "The cable system had run for years on Django and MySQL, first on a VPS and then on a Linux server I host myself. This year I rebuilt it as Rust services on Lambda behind CloudFront, with DynamoDB keyed from the access patterns rather than from the entities. Money moves in one transactional write that carries the business rows, an outbox record and an idempotency key together, so a retry cannot double-charge. The event path runs DynamoDB Streams into a Rust relay and SQS FIFO lanes, one per provider login, with dead-letter queues and an inbox check on every consumer. All of it is Terraform, with CloudWatch alarms and deploys that assume a role over OIDC instead of storing keys.",
};

// ===== OTHER PROJECTS =====
export const otherProjects = [
  {
    name: "Self-hosted infrastructure",
    line: "A 14-service Docker Compose stack on Ubuntu behind an nginx TLS reverse proxy, with Prometheus, Grafana and Loki for observability, and a default-deny firewall, fail2ban and WireGuard.",
  },
  {
    name: "Parallel video action recognition",
    line: "Trained an I3D model on a 17,124-video subset, cutting wall time from 6,462 to 3,462 seconds with two-GPU PyTorch DDP on SLURM, and compared DDP against FSDP1 and FSDP2.",
  },
  {
    name: "Cloud-native delivery pipeline",
    line: "Terraform across VPC, EC2 launch templates, RDS, S3, IAM and KMS, with Packer image builds and a test stage gating every pull request to main.",
  },
];

// ===== TECHNOLOGIES =====
export const technologies = [
  // Rewritten 2026-11-23 to match the resume's curated skills lines. The old list both
  // UNDER-sold (no Rust, Lambda, DynamoDB, SQS, CloudFront, Kubernetes, LangGraph, MLflow,
  // Databricks - i.e. none of the platform or AI work) and OVER-sold (Vanilla JS, Bootstrap,
  // Cron Jobs, HTML, CSS and Bash listed as Languages, Jupyter Notebook, R Studio).
  // Every entry here has a row in the resume repo's claims.csv. Flask is deliberately absent:
  // its ledger row reads `contradicted`.
  {
    name: "Languages",
    items: ["Python", "Rust", "TypeScript", "JavaScript", "Java", "C++", "SQL"],
  },
  {
    name: "Backend",
    items: ["FastAPI", "Django", "Node.js", "LangGraph", "MLflow", "REST APIs", "Celery"],
  },
  {
    name: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    name: "Data",
    items: ["DynamoDB", "PostgreSQL", "MySQL", "Redis", "Delta Lake", "Databricks Vector Search"],
  },
  {
    name: "Cloud & Infrastructure",
    items: [
      "AWS (Lambda, DynamoDB, S3, SQS, CloudFront, EC2, RDS)",
      "Serverless", "Terraform", "Docker", "Kubernetes", "Helm",
      "CI/CD", "GitHub Actions", "Linux", "GCP", "Databricks",
      "Prometheus", "Grafana", "Loki", "nginx",
    ],
  },
  {
    name: "AI / ML",
    items: [
      "PyTorch", "TensorFlow", "RAG", "Fine-Tuning",
      "DDP / FSDP", "SLURM", "Scikit-learn", "Pandas", "NumPy",
    ],
  },
];


// ===== APPS / TOOLS =====
// ⛔ THE SIX MINI-APPS WERE DROPPED 2026-11-23, and the reasoning is worth keeping.
//    All six were ready:false - a JSON formatter, regex tester, colour palette generator,
//    markdown previewer, unit converter and password generator, none of them built. They were
//    removed rather than finished because:
//      1. They are commodity. Thousands of each exist; six of them differentiate nothing.
//      2. They contradict the lane. The positioning is AI platform / backend / infrastructure;
//         six browser utilities read as frontend hobbyist.
//      3. The opportunity cost is the write-ups, which are the one format nobody else has and for
//         which there is unusually good raw material (a real 0->1, a five-year production system,
//         a migration with a rejected alternative and enumerated failure modes).
//    ➡️ Replaced by: one card + one write-up + one interactive diagram per real system.


// ===== NAV LINKS =====
export const navLinks = [
  { name: "Home", path: "/" },
  { name: "Writing", path: "/writing" },
  // ⛔ "Apps" removed from the nav 2026-11-23: all SIX apps are ready:false, so the page was
  //    six "Coming soon" cards plus a "More apps coming soon!" banner, advertised in the primary
  //    nav. For a candidate whose case rests on having shipped things, a page of unshipped things
  //    is worse than no page. The /apps route still resolves; it is simply not promoted.
  //    Put it back the day one of them actually works.
];