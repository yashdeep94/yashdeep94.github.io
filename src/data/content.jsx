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
  {
    name: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "Java", "C++", "Kotlin", "R", "SQL", "HTML", "CSS", "Bash"],
  },
  {
    name: "Frontend",
    items: ["React.js", "Jetpack Compose", "Material UI", "Tailwind CSS", "Bootstrap", "Vanilla JS"],
  },
  {
    name: "Backend & APIs",
    items: ["Django", "Flask", "Node.js", "Express.js", "REST APIs", "Celery", "Redis", "Cron Jobs"],
  },
  {
    name: "Databases",
    items: ["MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis"],
  },
  {
    name: "Cloud & DevOps",
    items: [
      "AWS (EC2, S3, ASG, ALB, CloudWatch)",
      "GCP", "DigitalOcean", "On-Prem Deployment",
      "Docker", "Terraform", "Packer",
      "CI/CD", "GitHub Actions",
      "Auto Scaling", "Load Balancing",
      "Monitoring & Logging", "Alerting",
      "Linux / Ubuntu", "Networking",
    ],
  },
  {
    name: "AI / ML & Data",
    items: [
      "PyTorch", "TensorFlow",
      "Neural Networks", "Deep Learning", "Diffusion Models",
      "RAG", "Fine-Tuning", "Custom Model Training",
      "SLURM (HPC Clusters)",
      "Scikit-learn", "Pandas", "NumPy",
      "Jupyter Notebook", "R Studio",
    ],
  },
  {
    name: "Tools & Testing",
    items: ["Git", "GitHub", "VS Code", "Postman", "Docker", "VMs", "Automated Testing", "DSA"],
  },
];

// ===== APPS / TOOLS =====
export const apps = [
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Paste raw JSON and get beautifully formatted, syntax-highlighted output with validation.",
    icon: "Braces",
    tags: ["JavaScript", "Parsing"],
    color: "#f59e0b",
    route: "/apps/json-formatter",
    ready: false,
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Write and test regular expressions with live matching, groups, and cheat sheet.",
    icon: "Search",
    tags: ["JavaScript", "Regex"],
    color: "#10b981",
    route: "/apps/regex-tester",
    ready: false,
  },
  {
    id: "color-palette",
    title: "Color Palette Generator",
    description: "Generate harmonious color palettes from a base color. Copy HEX, RGB, HSL values.",
    icon: "Palette",
    tags: ["React", "Design"],
    color: "#8b5cf6",
    route: "/apps/color-palette",
    ready: false,
  },
  {
    id: "markdown-preview",
    title: "Markdown Previewer",
    description: "Write markdown on the left, see rendered HTML on the right in real-time.",
    icon: "FileText",
    tags: ["React", "Markdown"],
    color: "#3b82f6",
    route: "/apps/markdown-preview",
    ready: false,
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between units of length, weight, temperature, speed, and more.",
    icon: "ArrowLeftRight",
    tags: ["React", "Utility"],
    color: "#ec4899",
    route: "/apps/unit-converter",
    ready: false,
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate strong passwords with custom length, symbols, numbers, and strength meter.",
    icon: "Shield",
    tags: ["JavaScript", "Security"],
    color: "#ef4444",
    route: "/apps/password-generator",
    ready: false,
  },
];

// ===== NAV LINKS =====
export const navLinks = [
  { name: "Home", path: "/" },
  { name: "Writing", path: "/writing" },
  { name: "Apps", path: "/apps" },
];