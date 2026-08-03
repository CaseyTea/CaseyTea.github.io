import { AppShell } from '../components/layout/AppShell'
import { AboutSection } from '../components/sections/AboutSection'
import { ContactSection } from '../components/sections/ContactSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { OverviewSection } from '../components/sections/OverviewSection'
import { ProjectsSection } from '../components/sections/ProjectsSection'
import { SkillsSection } from '../components/sections/SkillsSection'
import { portfolioData } from '../data/portfolio'

export function App() {
  return (
    <AppShell>
      <OverviewSection
        introduction={portfolioData.introduction}
        metrics={portfolioData.metrics}
        featuredProject={portfolioData.projects[0]}
        resumeUrl={portfolioData.resumeUrl}
      />
      <ExperienceSection experiences={portfolioData.experience} />
      <ProjectsSection projects={portfolioData.projects} />
      <SkillsSection skillGroups={portfolioData.skillGroups} />
      <AboutSection />
      <ContactSection
        contacts={portfolioData.contacts}
        location={portfolioData.location}
        resumeUrl={portfolioData.resumeUrl}
      />
    </AppShell>
  )
}
