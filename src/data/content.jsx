// ===== PERSONAL INFO =====
export const personalInfo = {
  name: "Yash Darekar",
  roles: [
    "Cloud Engineer",
    "Full Stack Developer",
    "AI & ML Engineer",
    "Problem Solver",
  ],
  bio: "Cloud Engineer & Full Stack Developer shipping production apps on bare metal, DigitalOcean, and AWS. From Django + React to Terraform infrastructure and GPU-accelerated ML pipelines I build end-to-end. Currently a Cloud Engineering Co-op.",
  email: "darekar.y@northeastern.edu",
  location: "Boston, MA",
  linkedin: "https://linkedin.com/in/yash-darekar-b69618222",
  github: "https://github.com/yashdeep94",
  resumeUrl: "/resume.pdf",
};

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
  { name: "Apps", path: "/apps" },
];