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

export const PROFILE: Profile = {
  summary:
    'Singapore-based software engineer and NUS Computer Science student focused on product engineering for complex, technical workflows.',
  about: [
    'Across MetaLearner, GovTech, the Singapore Armed Forces, and client delivery work, Chai keeps returning to the same kind of problem: technical systems that are hard to adopt, too manual to operate, or too brittle to trust. That has translated into onboarding flows, internal tooling, automated testing, SEO improvements, and operational training systems, with a consistent focus on making complex workflows clearer, more reliable, and easier to use.',
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
      label: 'Direction',
      value: 'Product engineering for technical users',
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
        'Improved product adoption with self-serve onboarding, in-product guidance, and better analysis tooling across core workflows.',
      caseStudyContext:
        'The work sat at the intersection of product onboarding and workflow usability: reducing dependence on support while making exploratory analysis easier inside the product.',
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
        'Built training systems and public cybersecurity experiences that improved operational readiness, drill speed, and awareness at scale.',
      caseStudyContext:
        'This role combined operational leadership with systems thinking, from fault-injection infrastructure and training design to a public-facing OSINT experience used for awareness building.',
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
        'Shipped internal platform tooling, SEO improvements, and CI-backed testing that reduced friction for government product teams.',
      caseStudyContext:
        'The clearest thread here was platform enablement: helping teams ship more confidently through better tooling, stronger search visibility, and automated quality checks.',
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
        'The work combined software delivery with client operations, translating certification and process requirements into systems teams could use day to day.',
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
      details: [
        'GPA 3.99/4.00.',
        'Graduated as valedictorian.',
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
  eyebrow: 'Onboarding / platform tooling / operational systems',
  description:
    'Singapore-based software engineer building onboarding, internal tooling, and operational systems for technical teams and mission-driven products.',
  manifesto:
    'I build onboarding, internal tooling, and operational systems for technical teams that need complex products to be easier to adopt, easier to operate, and easier to trust.',
  featuredWorkTitle:
    'Selected work across product, platform, and operational environments.',
  featuredWorkIntro:
    'Three tracks that best show the collaboration fit: self-serve product onboarding, government platform tooling, and cyber readiness systems with measurable outcomes.',
  archiveTitle: 'Writing that stays close to delivery work.',
  archiveIntro:
    'The writing archive is where implementation details, project retrospectives, and technical reasoning stay visible after the launch work is done.',
  primaryLink: {
    href: 'mailto:chaipinzheng@gmail.com',
    label: 'Start a collaboration',
    note: 'Email for product, platform, or cyber-adjacent builds',
  },
  secondaryLink: {
    href: '/about',
    label: 'Open the case studies',
    note: 'Writing, build notes, and deeper delivery context',
  },
  marqueeLines: [
    'Product systems',
    'Platform tooling',
    'Operational systems',
    'Guided onboarding',
    'Technical writing',
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
