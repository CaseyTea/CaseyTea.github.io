export type Metric = { value: string; label: string }

export type Experience = {
  id: string
  title: string
  organization: string
  dates: string
  summary: string
  highlights: string[]
  technologies: string[]
}

export type Project = {
  id: string
  name: string
  kind: 'professional' | 'side-project'
  outcome: string
  context: string
  contribution: string
  technologies: string[]
  image?: string
  sourceUrl?: string
  demoUrl?: string
}

export type SkillGroup = {
  title: string
  skills: string[]
}

export type NavItem = {
  label: string
  href: string
}

export type Contact = {
  label: string
  href: string
}

export type PortfolioData = {
  name: string
  title: string
  introduction: string
  avatarUrl: string
  resumeUrl: string
  location: string
  navItems: NavItem[]
  contacts: Contact[]
  metrics: Metric[]
  experience: Experience[]
  skillGroups: SkillGroup[]
  projects: Project[]
}
