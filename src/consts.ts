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
    'Early-career software engineer focused on product engineering, developer tooling, and operational systems for technical teams.',
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
  {
    href: '/rss.xml',
    label: 'rss',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/Ducksss',
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/chai-pin-zheng/',
    label: 'LinkedIn',
  },
  {
    href: 'mailto:chaipinzheng@gmail.com',
    label: 'Email',
  },
]

export const PROFILE: Profile = {
  summary:
    'Singapore-based software engineer and NUS Computer Science student focused on product engineering for complex, technical workflows.',
  about: [
    'Across MetaLearner, GovTech, the Singapore Armed Forces, and client delivery work, Chai keeps gravitating toward the same kind of problem: powerful systems that are too hard to adopt, too manual to operate, or too brittle to trust.',
    'That has translated into guided onboarding, internal platform tooling, automated testing, SEO improvements, and operational training systems. The same direction also shows up in Resumify, where product and full-stack work supported more inclusive hiring pathways for underserved jobseekers. The throughline is product engineering for technical users, with an emphasis on adoption, leverage, and reliability.',
  ],
  links: [
    {
      href: 'https://github.com/Ducksss',
      label: 'GitHub',
      note: 'Code, experiments, and technical work.',
    },
    {
      href: 'https://www.linkedin.com/in/chai-pin-zheng/',
      label: 'LinkedIn',
      note: 'Professional profile and full experience history.',
    },
    {
      href: 'mailto:chaipinzheng@gmail.com',
      label: 'Email',
      note: 'Direct contact for internships, roles, and collaborations.',
    },
  ],
  facts: [
    {
      label: 'Base',
      value: 'Singapore',
    },
    {
      label: 'Current track',
      value: 'NUS Computer Science',
    },
    {
      label: 'Standing',
      value: 'First Class track (GPA 4.6/5.00)',
    },
    {
      label: 'Direction',
      value: 'Product engineering for technical users',
    },
    {
      label: 'Scholarship',
      value: 'Stephen Riady Young Entrepreneur Scholar',
    },
    {
      label: 'Community impact',
      value: 'Co-founded Resumify, including a 2025 Yellow Ribbon MOU signing.',
    },
  ],
  metrics: [
    {
      value: '70%',
      label: 'Training efficiency lift',
    },
    {
      value: '1,000+',
      label: 'OSINT game players',
    },
    {
      value: '40+',
      label: 'Operators trained',
    },
    {
      value: '2.5k -> 6k',
      label: 'Weekly users reached',
    },
  ],
  hackathonStats: [
    {
      value: '62',
      label: 'Devpost hackathons',
    },
    {
      value: '12',
      label: 'Devpost projects',
    },
    {
      value: '10',
      label: 'Devpost achievements',
    },
  ],
  experience: [
    {
      id: 'metalearner',
      company: 'MetaLearner',
      role: 'Software Engineer Intern',
      period: 'Dec 2025 - Mar 2026',
      summary:
        'Built self-serve onboarding, in-product documentation, and exploratory chart tooling to improve adoption across core product workflows.',
      highlights: [
        'Eliminated onboarding drop-offs with a guided onboarding flow and in-product user guide that reduced reliance on field engineers and customer support.',
        'Combined multi-step onboarding, feature entry points, prompt-writing support, and structured guide categories into a clearer self-serve experience.',
        'Overhauled chart usability with legends, tooltips, responsive hover states, and an interactive time-series chart with zoom, pan, hover inspection, and dynamic scaling.',
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
      id: 'saf',
      company: 'Singapore Armed Forces',
      role: 'Tactical Cyber Defence Company Platoon Commander',
      period: 'Jul 2023 - Jul 2025',
      summary:
        'Led training systems and public cybersecurity experiences that improved readiness, drill speed, and awareness at operational scale.',
      highlights: [
        'Developed an automated fault injection system across a computer cluster, improving operational training efficiency by 70% and simulation accuracy by 20%.',
        'Designed and implemented a training plan for over 40 operators, increasing cyber incident response readiness scores by 25% and reducing security operations drill time by 15%.',
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
      company: 'Government Technology Agency',
      role: 'Full Stack Engineer Intern',
      period: 'Apr 2022 - Jun 2023',
      summary:
        'Shipped internal platform tooling, SEO improvements, and automated testing that reduced deployment friction for government product teams.',
      highlights: [
        'Created a TypeScript command-line tool for Government Digital Services teams to test, integrate, and deploy configurations onto the Developer Console as micro frontends.',
        'Revamped the Developer Portal community section to improve SEO and indexing, doubling traffic from 2.5k to 6k weekly users.',
        'Integrated Cypress into an existing Amplify and GitLab CI/CD pipeline, reducing manual visual checks and cutting deployment time by 20 minutes per merge to production.',
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
      role: 'Full Stack Developer and Database Engineer',
      period: 'Apr 2021 - Mar 2022',
      summary:
        'Built ISO9001-aligned workflow software and coordinated delivery across a five-person team for clients moving off manual, siloed processes.',
      highlights: [
        'Engineered a digitised platform aligned with ISO9001 requirements, migrating forms and process components from manual workflows to an online system.',
        'Worked with clients biweekly to gather requirements, refine plans, and keep delivery aligned with operational goals.',
        'Led a team of five developers as Delivery Manager, organising execution to keep projects on time and usable in production settings.',
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
      period: 'Aug 2025 - Aug 2028',
      details: [
        'GPA 4.6/5.00 (First Class Honours).',
        'Stephen Riady Young Entrepreneur Scholarship.',
      ],
    },
    {
      institution: 'Singapore Polytechnic',
      degree: 'Diploma in Information Technology',
      period: 'Apr 2020 - May 2023',
      details: [
        "GPA 3.99/4.00 (Valedictorian, Director's Honour Roll Academic Excellence 2020 - 2023).",
        'IMDA Gold Medallist.',
        'Singapore Polytechnic Scholarship Award (2020 - 2023).',
        'Distinctions in Data Engineering, Enterprise Systems, Frontend and Backend Development.',
      ],
    },
  ],
  awards: [
    'Stephen Riady Young Entrepreneur Scholarship',
    'IMDA Gold Medallist',
    'Singapore Polytechnic Scholarship Award (2020 - 2023)',
    'Valedictorian',
    "Director's Honour Roll Academic Excellence (2020 - 2023)",
  ],
  hackathonWins: [
    'Xylem Water Technology Global Hackathon 2024 - Second Place Award',
    'NUS LifeHack 2023 - First Place + SGID Award',
    'LionCityHacks 2022 - Best Overall Award',
    'NTU MLDA Deep Learning Week Hackathon 2021 - Best Junior Hack',
    'PolyFinTech100 API Hackathon - Regulatory Tech Merit Award',
    'Codeout 2021 - Competitive Programming Second Place Award',
    'NTU IntuitionV10 Hackathon 2024 - Best in Hardware Award',
    'Innovate2Educate Hackathon - First Place Award',
    'ChargerHacks 2023 - Best College / University Division Award',
    'HackLah! - First Place Award',
  ],
  initiatives: [
    {
      name: 'Resumify',
      role: 'Co-founder / Full-Stack Lead',
      period: 'Dec 2023 - Feb 2025',
      summary:
        'Co-founded a social-impact hiring platform that used AI to simplify resume creation and job matching for underserved jobseekers, then helped turn it into a partnership-backed initiative through Yellow Ribbon.',
      highlights: [
        'Built the user-facing platform in Next.js to make resume creation and job matching more accessible for underserved communities, including ex-offenders and persons with disabilities.',
        'Partnered with the Singapore Prison Service and Yellow Ribbon Project on a pilot that supported rehabilitation and reintegration through a one-stop centre and online consultations.',
        'Extended volunteering-inspired work into a real employment-access initiative, including a 2025 MOU signing with Yellow Ribbon.',
      ],
      tags: [
        'Next.js',
        'AI for hiring',
        'Social impact',
        'Inclusive design',
        'Yellow Ribbon',
      ],
    },
  ],
  leadership: [
    {
      organization: 'SEED (Sharing, Exploration, Enrichment, Development) SIG',
      role: 'Vice President',
      period: 'Mar 2021 - Mar 2022',
      highlights: [
        'Facilitated hands-on workshops on JavaScript and backend development to help students build practical software skills.',
        'Collaborated with other SIGs to organise CodeLeague2021, a faculty-wide hackathon that attracted 120 participants.',
        'Led weekly meetings to track deliverables, surface blockers, and keep the student organisation moving.',
      ],
    },
    {
      organization: 'SPAI',
      role: 'Sub Committee Member',
      period: 'Mar 2021 - Mar 2022',
      highlights: [
        "Conceived Project Cactus, a fake-news detection web extension showcased at Singapore Polytechnic's Open House and Engineering Show 2022.",
        'Helped engage over 500 visitors by framing AI applications in a practical misinformation-detection experience.',
        'Organised and hosted SPAI Hackathon 2022, a faculty-wide competition for over 150 students across different technical backgrounds.',
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
      items: ['React', 'React Native', 'Vue', 'HTML', 'CSS', 'jQuery'],
    },
    {
      label: 'Backend & data',
      items: ['Node.js', 'FastAPI', 'PostgreSQL', 'MySQL', 'Redis', 'JWT'],
    },
    {
      label: 'Delivery',
      items: ['CI/CD', 'Cypress', 'AWS', 'SEO', 'Test automation', 'Agile'],
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
  eyebrow: 'Product engineering / developer tooling / operational systems',
  description:
    'A dark, directed front page for product engineering, developer tooling, technical writing, and operational systems work.',
  manifesto:
    'My direction is product engineering for complex systems. I do my best work where adoption, internal tooling, and operational clarity matter just as much as feature delivery.',
  featuredWorkTitle: 'One direction across three very different environments.',
  featuredWorkIntro:
    'From product onboarding to government platform tooling to cyber training systems, the common thread is the same: make technical systems easier to adopt, operate, and trust.',
  processTitle:
    'How I usually work when the problem sits between users and complex systems.',
  processIntro:
    'The environments change, but the pattern is consistent: find the friction, create the self-serve path, harden the system, and prove the outcome with something measurable.',
  signalConsoleTitle: 'Three lenses that make the direction clearer.',
  signalConsoleIntro:
    'Together these say more than a generic portfolio label: the work lives at the boundary between adoption, tooling, and operational readiness.',
  archiveTitle: 'Writing that supports the engineering direction.',
  archiveIntro:
    'The writing archive stays close to the work itself: project retrospectives, hackathon notes, implementation details, and technical reasoning rather than detached commentary.',
  finalTitle:
    'If you want the direction in one sentence: I build product systems for technical users.',
  finalDescription:
    'Start with the profile for the career narrative, then the writing for how I think through systems, front-end craft, and implementation detail.',
  primaryLink: {
    href: '/about',
    label: 'Open the profile',
    note: 'Experience timeline, education, and case studies',
  },
  secondaryLink: {
    href: '/blog',
    label: 'Read the writing',
    note: 'Technical notes, interface work, and build logs',
  },
  closingLinks: [
    {
      href: '/about',
      label: 'About',
    },
    {
      href: '/blog',
      label: 'Blog index',
    },
    {
      href: '/rss.xml',
      label: 'RSS feed',
    },
  ],
  marqueeLines: [
    'product engineering',
    'developer tooling',
    'operational readiness',
    'technical writing',
    'real-time systems',
    'seo and ci/cd',
  ],
  capabilityLines: [
    {
      label: '01',
      title: 'Adoption',
      description:
        'Onboarding flows, in-product guidance, and user-facing systems that help technical products explain themselves.',
    },
    {
      label: '02',
      title: 'Leverage',
      description:
        'Internal tooling, CI/CD automation, SEO improvements, and platform work that make teams faster and systems easier to run.',
    },
    {
      label: '03',
      title: 'Readiness',
      description:
        'Operational training systems, incident-response readiness, and public cybersecurity work shaped by real constraints and measurable performance.',
    },
  ],
  processSteps: [
    {
      label: '01',
      title: 'Identify the friction',
      description:
        'Start with the real blocker: where users drop off, where operators slow down, or where teams are relying on manual workarounds.',
      detail:
        'The first pass is diagnostic. Metrics, workflow pain, and operational context shape what gets built next.',
    },
    {
      label: '02',
      title: 'Design the self-serve path',
      description:
        'Turn that friction into a clearer system: onboarding flows, better docs, safer defaults, or tools that let people move without constant support.',
      detail:
        'The goal is not extra surface area. It is a path that makes the right next step obvious.',
    },
    {
      label: '03',
      title: 'Harden reliability',
      description:
        'Once the path is clear, make it dependable with better tooling, testing, automation, or architecture.',
      detail:
        'This is where CI/CD, observability, scalable prototypes, and repeatable drills matter most.',
    },
    {
      label: '04',
      title: 'Ship the measurable result',
      description:
        'The final pass is outcome-driven: adoption, training speed, readiness, traffic, or time saved per release.',
      detail:
        'A polished interface matters, but the result needs numbers, operator feedback, or team leverage behind it.',
    },
  ],
  signalPanels: [
    {
      id: 'product-systems',
      label: 'Adoption',
      title: 'Self-serve experiences that reduce support load.',
      summary:
        'The strongest product work in the resume is about entry points: how users onboard, how they discover features, and how the product teaches itself.',
      bullets: [
        'Guided onboarding and in-product user guidance at MetaLearner',
        'Prompt-writing support and structured guide categories for self-serve adoption',
        'Interactive charting and exploratory tooling designed for real product usage',
      ],
      footer:
        'The product layer matters most when it removes friction without adding noise.',
    },
    {
      id: 'full-stack-delivery',
      label: 'Leverage',
      title: 'Tooling, automation, and platform work that scales teams.',
      summary:
        'Behind the visible interface work is a systems layer: internal tooling, SEO, testing pipelines, and architecture prototypes that improve leverage for teams.',
      bullets: [
        'TypeScript CLI tooling for micro frontend deployment flows at GovTech',
        'Cypress integrated into existing Amplify and GitLab CI/CD workflows',
        'FastAPI, WebSockets, Redis pub/sub, PostgreSQL, JWT, and Docker Compose for real-time architecture exploration',
      ],
      footer:
        'The connective tissue is often the highest-leverage part of the build.',
    },
    {
      id: 'cyber-operations',
      label: 'Readiness',
      title: 'Operational training systems shaped by real constraints.',
      summary:
        'The cyber work centers on readiness, drills, and operator confidence: systems that are judged by how well teams perform under pressure.',
      bullets: [
        'Automated fault injection across a computer cluster for more realistic training',
        'Training plans and drills for 40+ operators with TCIRT and TSOT protocols',
        'A public OSINT game that turned cybersecurity awareness into an accessible interactive experience',
      ],
      footer:
        'Operational credibility comes from readiness, not just presentation.',
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
    'Building product systems, full-stack tooling, and cyber workflows with clarity.',
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
