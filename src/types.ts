export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  featuredPostCount: number
  postsPerPage: number
}

export type SocialLink = {
  href: string
  label: string
}

export type ProfileLink = {
  href: string
  label: string
  note: string
}

export type ProfileFact = {
  label: string
  value: string
}

export type ProfileMetric = {
  value: string
  label: string
}

export type ProfileExperience = {
  id: string
  company: string
  role: string
  period: string
  timelineSummary: string
  caseStudyContext: string
  highlights: string[]
  tags: string[]
  featured?: boolean
}

export type ProfileEducation = {
  institution: string
  degree: string
  period: string
  details: string[]
}

export type ProfileLeadership = {
  organization: string
  role: string
  period: string
  highlights: string[]
}

export type ProfileInitiative = {
  name: string
  role: string
  period: string
  summary: string
  highlights: string[]
  tags: string[]
}

export type ProfileSkillGroup = {
  label: string
  items: string[]
}

export type Profile = {
  summary: string
  about: string[]
  links: ProfileLink[]
  facts: ProfileFact[]
  metrics: ProfileMetric[]
  hackathonStats: ProfileMetric[]
  experience: ProfileExperience[]
  education: ProfileEducation[]
  awards: string[]
  hackathonWins: string[]
  initiatives: ProfileInitiative[]
  leadership: ProfileLeadership[]
  skills: ProfileSkillGroup[]
  certifications: string[]
}

export type IconMap = {
  [key: string]: string
}

export type LandingLink = {
  href: string
  label: string
  note?: string
}

export type LandingCapability = {
  label: string
  title: string
}

export type FooterContent = {
  eyebrow: string
  headline: string
  copy: string
  primaryContact: LandingLink
  baseLabel: string
  baseValue: string
  linksLabel: string
  contactLinks: LandingLink[]
  signature: string
}

export type LandingContent = {
  name: string
  monogram: string
  eyebrow: string
  description: string
  manifesto: string
  featuredWorkTitle: string
  featuredWorkIntro: string
  archiveTitle: string
  archiveIntro: string
  primaryLink: LandingLink
  secondaryLink: LandingLink
  marqueeLines: string[]
  capabilityLines: LandingCapability[]
}
