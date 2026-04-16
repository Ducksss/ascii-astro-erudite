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
    'Singapore-based software engineer helping technical teams reduce product friction, operational drag, and handoff risk.',
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
    'Singapore-based software engineer and NUS Computer Science student building onboarding, internal tooling, and operator-facing systems that make complex products easier to adopt and trust.',
  about: [
    'I work on the layer between technical capability and actual adoption: guided onboarding, operator-facing tools, delivery systems, and handoff assets that help strong products feel usable faster.',
    'Recent proof spans MetaLearner, GovTech, the Singapore Armed Forces, and Resumify. The pattern is consistent: reduce manual friction, make the next action clearer, and leave teams with systems they can keep using.',
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
      value: 'NUS Computer Science',
    },
    {
      label: 'Best fit',
      value: 'Product adoption, internal tooling, and operator-facing systems.',
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
      timelineSummary:
        'Shipped guided onboarding, chart demos, and handoff assets that made a forecasting product easier to enter and extend.',
      caseStudyContext:
        'I worked on the product-friction layer: clearer first-time guidance, more legible charts, and handoff assets the team could keep building from after the internship ended.',
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
      timelineSummary:
        'Led cyber-readiness systems, drills, and public cybersecurity experiences that improved training efficiency, drill speed, and awareness.',
      caseStudyContext:
        'I treated readiness like a system: automate fault injection, codify recurring drills, and turn cyber concepts into training surfaces people could actually use.',
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
      timelineSummary:
        'Built platform tooling, SEO improvements, and CI-backed testing that let government product teams ship faster with less manual checking.',
      caseStudyContext:
        'The throughline here was platform enablement: internal CLI tooling, search improvements that expanded reach, and release automation that reduced manual checking.',
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
      timelineSummary:
        'Built ISO9001-aligned workflow software and coordinated delivery for clients moving off manual, siloed processes.',
      caseStudyContext:
        'This was workflow digitisation work close to real operations: requirements gathering, database design, and delivery coordination for teams moving off manual processes.',
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
        'GPA 4.60/5.00.',
        'Stephen Riady Young Entrepreneur Scholarship recipient.',
      ],
    },
    {
      institution: 'Singapore Polytechnic',
      degree: 'Diploma in Information Technology',
      period: 'Apr 2020 - May 2023',
      details: ['GPA 3.99/4.00.', 'Graduated as valedictorian.'],
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
        'Co-founded a Next.js hiring platform that made resume creation and job matching easier for underserved jobseekers, then helped turn it into a Yellow Ribbon-backed initiative.',
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
  eyebrow:
    'For teams shipping complex products, tooling, and operational workflows',
  description:
    'Singapore-based software engineer with shipped work in onboarding, internal tooling, and operational systems for technical teams and mission-driven products.',
  manifesto:
    'I make complex products easier to enter, operate, and trust through clearer onboarding, internal tooling, and operator-facing systems.',
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
