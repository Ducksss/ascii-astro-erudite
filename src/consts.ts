import type {
  FooterContent,
  IconMap,
  LandingContent,
  Profile,
  SocialLink,
  Site,
} from '@/types'
import { resolveSiteUrl } from '@/lib/site-config'

const SITE_URL = resolveSiteUrl({
  ...process.env,
  ...(import.meta.env ?? {}),
})

export const SITE: Site = {
  title: 'Chai Pin Zheng',
  description:
    'Product Engineer at Reactor School, NUS Computer Science student and open-source maintainer building useful software and student communities.',
  href: SITE_URL,
  author: 'Chai Pin Zheng',
  locale: 'en-US',
  featuredPostCount: 3,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/about',
    label: 'about',
  },
  {
    href: '/blog',
    label: 'writing',
  },
]

export const PROFILE: Profile = {
  summary:
    'I am a Product Engineer at Reactor School and a penultimate-year NUS Computer Science student. I build data workflows, product interfaces and open-source tools, and help student communities with technology and events.',
  about: [
    'At Reactor School, I work on ReactorOS: participant imports, data enrichment, tenant isolation and warm-introduction routes. Earlier roles at MetaLearner, Taskade, GovTech and the Singapore Army covered onboarding, integrations, developer tooling and cyber training.',
    'Outside work, I maintain Payload Components, co-founded Resumify and contribute to The Collective and The LaunchPad Challenge. I enjoy taking a practical problem through design, implementation, testing and handoff.',
  ],
  links: [
    {
      href: 'https://github.com/Ducksss',
      label: 'GitHub',
      note: 'Repos, prototypes, and technical handoffs.',
    },
    {
      href: 'https://www.linkedin.com/in/chai-pin-zheng/',
      label: 'LinkedIn',
      note: 'Roles, timelines, and experience proof.',
    },
    {
      href: 'mailto:chaipinzheng@gmail.com',
      label: 'Email',
      note: 'Best for internships, roles, and collaborations.',
    },
  ],
  facts: [
    {
      label: 'Base',
      value: 'Singapore',
    },
    {
      label: 'Current track',
      value: 'Product Engineer at Reactor School / NUS Computer Science',
    },
    {
      label: 'Best fit',
      value: 'Product engineering, backend systems and developer tooling.',
    },
    {
      label: 'Community impact',
      value:
        'Resumify co-founder, LaunchPad technical lead and The Collective contributor.',
    },
  ],
  metrics: [
    {
      value: '≤24h -> ~2m',
      label: 'Enrichment retry wait',
    },
    {
      value: '70%',
      label: 'Training efficiency lift',
    },
    {
      value: '1,000+',
      label: 'OSINT game players',
    },
    {
      value: '2.5k -> 7.4k',
      label: 'GovTech weekly users',
    },
  ],
  hackathonStats: [
    {
      value: '91',
      label: 'Devpost events joined',
    },
    {
      value: '17',
      label: 'Devpost projects',
    },
    {
      value: '67',
      label: 'Submission links',
    },
  ],
  experience: [
    {
      id: 'reactor-school',
      company: 'Reactor School',
      role: 'Product Engineer',
      period: 'May 2026 - Present',
      timelineSummary:
        'Build participant imports, tenant-safe data workflows and warm-introduction tools for ReactorOS in Ho Chi Minh City through NOC Vietnam.',
      caseStudyContext:
        'I work across the ReactorOS interface and data layer, helping teams import incomplete participant records, find useful introductions and run enrichment reliably.',
      highlights: [
        'Designed and built a four-stage participant import: upload, mapping, validation and commit, with editable mappings, sample previews and row-level skip or overwrite decisions that preserve existing data.',
        'Engineered a queue-aware PostgreSQL scheduler that reduced enrichment retry waits from up to 24 hours to approximately two minutes, using expiring worker leases and atomic per-run budget enforcement.',
        'Built a multi-tenant Supabase/PostgreSQL data layer with row-level security, tenant-scoped foreign keys and restricted RPCs, validated against 607 pgTAP assertions.',
        'Built a pathfinder ranking up to five warm-introduction routes across alumni, ventures and cohorts, with hop-by-hop reasons, weak-link indicators and keyboard-accessible comparison controls.',
        'Fixed authentication responses for fetch clients and AI streams while preserving browser and MFA redirects, with browser regression coverage for authentication and CSV imports.',
      ],
      tags: [
        'Next.js',
        'TypeScript',
        'Supabase',
        'PostgreSQL',
        'Playwright',
        'Product design',
      ],
      featured: true,
    },
    {
      id: 'metalearner',
      company: 'MetaLearner',
      role: 'Software Engineer Intern',
      period: 'Dec 2025 - Mar 2026',
      timelineSummary:
        'Shipped guided onboarding, chart demos, and handoff assets that made a forecasting product easier to enter and extend.',
      caseStudyContext:
        'I worked on the product-friction layer: clearer first-time guidance, more legible charts, and handoff assets the team could keep building from after the internship ended.',
      highlights: [
        'Designed and shipped contextual onboarding and a four-category User Guide, keeping dashboard context visible while introducing task-based guidance, step navigation and AI prompt examples.',
        'Delivered nine interactive chart demos across six categories and three locales, with legends, tooltips, zoom, hover inspection and dynamic axis scaling for live time-series data.',
        'Developed responsive Figma concepts and a shadcn/ui design-system direction, iterating with stakeholders on KPI hierarchy, chat-led workflows, typography and spacing.',
        'Prototyped a real-time messaging architecture with FastAPI, WebSockets, Redis pub/sub, PostgreSQL, JWT, and Docker Compose to evaluate a scalable, low-latency chat system.',
      ],
      tags: [
        'Product onboarding',
        'In-product docs',
        'FastAPI',
        'WebSockets',
        'Redis',
        'PostgreSQL',
      ],
      featured: true,
    },
    {
      id: 'taskade',
      company: 'Taskade',
      role: 'Software Engineer Intern',
      period: 'May 2025 - Aug 2025',
      timelineSummary:
        'Built external API connectors and reusable product interfaces for multi-step automation workflows.',
      caseStudyContext:
        'I worked on the integrations and interface behind customer automations, making external services more reliable to use inside multi-step workflows.',
      highlights: [
        'Engineered connectors for Gmail, Google Drive, Facebook and other business platforms, integrating external APIs with Temporal-backed queues.',
        'Hardened OAuth, retries, rate-limit handling and failure recovery so customers could build reliable multi-step automations.',
        'Delivered product pages and reusable UI components across the web app while resolving frontend issues in the YC S19 engineering team.',
      ],
      tags: [
        'API integrations',
        'Temporal',
        'OAuth',
        'Workflow automation',
        'Frontend',
      ],
    },
    {
      id: 'saf',
      company: 'Singapore Armed Forces',
      role: 'Cyber Defence Company Platoon Commander',
      period: '2023 - 2025',
      timelineSummary:
        'Led cyber-readiness systems, drills, and public cybersecurity experiences that improved training efficiency, drill speed, and awareness.',
      caseStudyContext:
        'I treated readiness like a system: automate fault injection, codify recurring drills, and turn cyber concepts into training surfaces people could actually use.',
      highlights: [
        'Developed an automated fault injection system across a computer cluster, improving operational training efficiency by 70% and simulation accuracy by 20%.',
        'Designed and implemented a training plan combining recurring cyber drills with scenario-based operations.',
        'Embedded Tactical Cyber Incident Response Team and Tactical Security Operations Team protocols into recurring exercises and scenario-based operations.',
        'Spearheaded a public-facing OSINT game built with Next.js, showcased by Army, that attracted over 1,000 players and raised awareness about oversharing personal information online.',
      ],
      tags: [
        'Cyber defence',
        'Training systems',
        'Incident response',
        'SOC operations',
        'Next.js',
        'Leadership',
      ],
      featured: true,
    },
    {
      id: 'govtech',
      company: 'GovTech Singapore',
      role: 'Software Engineer Intern',
      period: 'Apr 2022 - Jul 2023',
      timelineSummary:
        'Built platform tooling, SEO improvements, and CI-backed testing that let government product teams ship faster with less manual checking.',
      caseStudyContext:
        'The throughline here was platform enablement: internal CLI tooling, search improvements that expanded reach, and release automation that reduced manual checking.',
      highlights: [
        'Created a TypeScript command-line tool for Government Digital Services teams to test, integrate, and deploy configurations onto the Developer Console as micro frontends.',
        'Rebuilt the Developer Portal community section as statically generated Jekyll/Liquid pages with individual-page indexing, contributing to weekly traffic growth from 2,500 to 7,400 users over six months.',
        'Built custom Docsify plugins, including an open-source table-of-contents plugin that reached over 2,000 weekly npm downloads.',
        'Integrated Cypress regression testing into the Amplify and GitLab CI/CD pipeline to reduce manual release checks.',
      ],
      tags: [
        'TypeScript',
        'CLI tooling',
        'Micro frontends',
        'SEO',
        'Cypress',
        'GitLab CI/CD',
      ],
      featured: true,
    },
    {
      id: 'associates-consulting',
      company: 'Associates Consulting',
      role: 'Full Stack Engineer',
      period: '2021 - 2022',
      timelineSummary:
        'Built ISO9001-aligned workflow software and coordinated delivery for clients moving off manual, siloed processes.',
      caseStudyContext:
        'This was workflow digitisation work close to real operations: requirements gathering, database design, and delivery coordination for teams moving off manual processes.',
      highlights: [
        'Engineered a digitised platform aligned with ISO9001 requirements, migrating forms and process components from manual workflows to an online system.',
        'Worked with clients biweekly to gather requirements, refine plans, and keep delivery aligned with operational goals.',
        'Led a team of five developers as Delivery Manager, organising execution to keep projects on time and usable in production settings.',
        'Optimised the Quality Management System database, reducing query time by 5%.',
      ],
      tags: [
        'Full-stack delivery',
        'Database engineering',
        'ISO9001',
        'Client delivery',
        'Team leadership',
      ],
    },
  ],
  education: [
    {
      institution: 'National University of Singapore',
      degree: 'Bachelor of Computing in Computer Science',
      period: 'Aug 2025 - 2028 (expected)',
      details: [
        'Penultimate-year student with recognised transfer credits. GPA 4.50/5.00.',
        'Stephen Riady Young Entrepreneur Scholarship recipient.',
        'NUS Overseas Colleges Vietnam, including Product Engineer work at Reactor School.',
      ],
    },
    {
      institution: 'Singapore Polytechnic',
      degree: 'Diploma in Information Technology (With Merit)',
      period: 'Apr 2020 - Mar 2023',
      details: ['GPA 3.99/4.00.', 'Graduated as valedictorian.'],
    },
  ],
  awards: [
    'Stephen Riady Young Entrepreneur Scholarship',
    'IMDA Gold Medal (2023)',
    'NUS School of Computing Student Awards 2025: Silver, Service and Involvement',
    'Singapore Polytechnic Scholarship',
    'Valedictorian',
    "Director's Honour Roll (AY2020/21 and AY2021/22)",
  ],
  hackathonWins: [
    'AverixHacks 2026 - First Place, Best Overall Hack',
    'The Merge Hackathon 2026 - Second Place',
    'DesignXR Hackathon 2026 - Runner-Up',
    'HackOMania 2024 - Champion',
    'Xylem Water Technology Global Hackathon 2024 - Official Winner',
    'NUS LifeHack 2023 - First Place + SGID Award',
    'LionCityHacks 2022 - Best Designed Project',
    'NTU MLDA Deep Learning Week Hackathon 2021 - Best Junior Hack',
    'NTU IntuitionV10 Hackathon 2024 - Best in Hardware Award',
    'Innovate2Educate Hackathon - First Place Award',
    'HackLah! - First Place Award',
  ],
  initiatives: [
    {
      name: 'Payload Components',
      role: 'Primary maintainer',
      period: 'Open source / ongoing',
      summary:
        'An MIT-licensed registry and CLI for typed Payload CMS v3 and Next.js blocks, built to make repeated CMS integration work easier for the community.',
      highlights: [
        'Ship reviewable source with Payload collection registration, RenderBlocks mapping, type generation and the admin import map handled by the installer.',
        'Maintain documentation, releases, issue triage and install checks so contributors and consuming projects can work from a clear contract.',
      ],
      tags: [
        'Open source',
        'Payload CMS',
        'Next.js',
        'TypeScript',
        'CLI tooling',
      ],
    },
    {
      name: 'Resumify',
      role: 'Co-founder / Fullstack Lead Engineer',
      period: 'Volunteering / ongoing',
      summary:
        'Co-founded an AI-assisted hiring platform for underserved jobseekers, with team-built conversational resume support and a 2025 Yellow Ribbon Singapore partnership.',
      highlights: [
        'Built resume creation, upload and editing interfaces and implemented the team dashboard redesign, with clearer entry actions, contextual guidance and keyboard-accessible upload.',
        'Worked with the team, social workers and career counsellors on writing barriers faced by former offenders; the conversational AI turns spoken experience into professional resume language.',
        'Adapted the platform for Singapore Prison Service use through Yellow Ribbon, addressing device-display constraints, whitelisting and entry routing for candidates and staff.',
        'Contributed to the initiative that signed a 2025 MOU with Yellow Ribbon Singapore.',
      ],
      tags: [
        'Next.js',
        'AI for hiring',
        'Social impact',
        'Inclusive design',
        'Yellow Ribbon',
      ],
    },
    {
      name: 'Genium & Co. / Octilyon',
      role: 'Design direction and development',
      period: 'Client collaborations',
      summary:
        'Collaborative website work connecting design direction, implementation and live client feedback, including an Ireland-based health-tech client.',
      highlights: [
        'For Genium & Co., contributed design direction and development alongside developer Kei Lok Tham and UI/UX designer Bridget Claire.',
        'For Octilyon, led visual direction and coding during live client sessions, with development by Kei Lok Tham and UI/UX support from Bridget Claire and Vanessa Wijaya.',
      ],
      tags: [
        'Client collaboration',
        'UI/UX',
        'Web development',
        'Design direction',
      ],
    },
  ],
  leadership: [
    {
      organization: 'Edu2030 Vibe Hackathon Workshop',
      role: 'Workshop co-facilitator',
      period: '13 Sep 2026',
      highlights: [
        'Co-delivered a hands-on AI-assisted building workshop with Emilio Huang for 12 teams, helping participants turn ideas into a practical project workflow.',
      ],
    },
    {
      organization: 'The LaunchPad Challenge / Symposium',
      role: 'Technical lead / Co-organiser',
      period: '2026 programme',
      highlights: [
        'Built and maintained the Astro/React website, partner inquiry backend, MDX publishing and SEO infrastructure, with browser tests and deployment fixes.',
        'Co-authored the partner-track briefing and evaluation rubric. The programme concluded with the NUS Symposium on 17-18 August 2026.',
      ],
    },
    {
      organization: 'The Collective',
      role: 'Scaling and technology contributor',
      period: 'Jan 2026 - Present',
      highlights: [
        'Help a Singapore student founder community with technology, AI-assisted lead generation, SEO and partnership outreach.',
      ],
    },
    {
      organization: 'Sip & Scale Saigon: Episode 1',
      role: 'Co-host',
      period: '17 Jul 2026',
      highlights: [
        'Co-hosted the Tech59 Summit after-party at The Sentry Q in Ho Chi Minh City with Reactor School and fellow organisers.',
      ],
    },
    {
      organization: 'NUS Commencement Class Giving 2026',
      role: 'School of Computing Class Champion',
      period: 'Mar 2026 - Present',
      highlights: [
        'Help build awareness of giving and raise funds for students from less privileged backgrounds.',
      ],
    },
    {
      organization: 'SEED (Sharing, Exploration, Enrichment, Development) SIG',
      role: 'Vice President',
      period: 'During my Singapore Polytechnic diploma',
      highlights: [
        'Facilitated hands-on workshops on JavaScript and backend development to help students build practical software skills.',
        'Collaborated with other SIGs to organise the faculty-wide CodeLeague 2021 hackathon.',
        'Led weekly meetings to track deliverables, surface blockers, and keep the student organisation moving.',
      ],
    },
    {
      organization: 'SPAI',
      role: 'Sub Committee Member',
      period: 'During my Singapore Polytechnic diploma',
      highlights: [
        "Conceived Project Cactus, a fake-news detection web extension showcased at Singapore Polytechnic's Open House and Engineering Show 2022.",
        'Helped explain practical AI applications through a misinformation-detection experience.',
        'Helped organise the faculty-wide SPAI hackathon for students across different technical backgrounds.',
      ],
    },
  ],
  skills: [
    {
      label: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
    },
    {
      label: 'Frontend',
      items: [
        'React',
        'Next.js',
        'React Native',
        'Vue',
        'HTML',
        'CSS',
        'Figma',
      ],
    },
    {
      label: 'Backend & data',
      items: [
        'Node.js',
        'FastAPI',
        'PostgreSQL',
        'Supabase',
        'MySQL',
        'Redis',
        'Temporal',
      ],
    },
    {
      label: 'Delivery',
      items: ['CI/CD', 'Playwright', 'pgTAP', 'Cypress', 'AWS', 'SEO'],
    },
  ],
  certifications: [
    'AI FOR INDUSTRY - Foundations in AI',
    'Explore ML with Crowdsource Beginner Track',
    'Google IT Automation with Python Specialization',
    'HackerRank JavaScript (Intermediate)',
    'HackerRank SQL (Intermediate)',
  ],
}

export const LANDING: LandingContent = {
  name: 'Chai Pin Zheng',
  monogram: 'CPZ',
  eyebrow:
    'For teams shipping complex products, tooling, and operational workflows',
  description:
    'Product Engineer at Reactor School and penultimate-year NUS Computer Science student building data workflows, product interfaces, open-source tools and communities.',
  manifesto:
    'I build data workflows, product interfaces and open-source tools.',
  featuredWorkTitle:
    'Proof across product onboarding, platform delivery, and operational systems.',
  featuredWorkIntro:
    'Three proof blocks that show the fit quickly: self-serve product adoption, platform delivery, and cyber-readiness systems.',
  archiveTitle: 'Writing that shows the work.',
  archiveIntro:
    'The archive keeps builds, tradeoffs, and delivery artifacts visible after the feature ships.',
  primaryLink: {
    href: 'mailto:chaipinzheng@gmail.com',
    label: 'Start a collaboration',
    note: 'Best for onboarding, tooling, or operational systems work',
  },
  secondaryLink: {
    href: '/about',
    label: 'See proof & case studies',
    note: 'Outcomes first, then deeper delivery proof',
  },
  marqueeLines: [
    'Guided onboarding',
    'Platform tooling',
    'Operational systems',
    'Product friction',
    'Technical handoffs',
    'Cyber-adjacent workflows',
  ],
  capabilityLines: [
    {
      label: '01',
      title: 'Adoption',
    },
    {
      label: '02',
      title: 'Delivery',
    },
    {
      label: '03',
      title: 'Readiness',
    },
  ],
}

const currentYear = new Date().getFullYear()
const emailLink = PROFILE.links.find((item) => item.label === 'Email')
const githubLink = PROFILE.links.find((item) => item.label === 'GitHub')
const linkedInLink = PROFILE.links.find((item) => item.label === 'LinkedIn')
const emailAddress =
  emailLink?.href.replace(/^mailto:/, '') ?? 'chaipinzheng@gmail.com'

export const FOOTER: FooterContent = {
  eyebrow: 'Contact',
  headline:
    'Building onboarding, internal tooling, and operational systems with clear proof.',
  copy: PROFILE.summary,
  primaryContact: {
    href: emailLink?.href ?? 'mailto:chaipinzheng@gmail.com',
    label: emailAddress,
  },
  baseLabel: 'Base',
  baseValue: PROFILE.facts[0]?.value ?? 'Singapore',
  linksLabel: 'Links',
  contactLinks: [
    {
      href: emailLink?.href ?? 'mailto:chaipinzheng@gmail.com',
      label: 'Email',
    },
    {
      href: githubLink?.href ?? 'https://github.com/Ducksss',
      label: 'GitHub',
    },
    {
      href: '/rss.xml',
      label: 'RSS',
    },
    {
      href: '/signal-room/ascii-signal',
      label: 'ASCII Playground',
    },
    {
      href: linkedInLink?.href ?? 'https://www.linkedin.com/in/chai-pin-zheng/',
      label: 'LinkedIn',
    },
  ],
  signature: `${LANDING.name} / ${currentYear}`,
}

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
