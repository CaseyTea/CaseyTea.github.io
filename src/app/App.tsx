import { CommandPalette } from '../components/command/CommandPalette'
import { AppShell } from '../components/layout/AppShell'
import { AboutSection } from '../components/sections/AboutSection'
import { ContactSection } from '../components/sections/ContactSection'
import { ExperienceSection } from '../components/sections/ExperienceSection'
import { OverviewSection } from '../components/sections/OverviewSection'
import { ProjectsSection } from '../components/sections/ProjectsSection'
import { SkillsSection } from '../components/sections/SkillsSection'
import { portfolioData } from '../data/portfolio'
import type { Command } from '../data/types'

function activateSection(id: string) {
  window.location.hash = id
  document.getElementById(id)?.focus({ preventScroll: true })
}

export function App() {
  const commands: Command[] = [
    ...portfolioData.commandSections.map(({ id, keywords, label }) => ({
      id: `section-${id}`,
      label,
      keywords,
      run: () => activateSection(id),
    })),
    {
      id: 'resume',
      label: 'Download resume',
      keywords: ['resume', 'cv', 'pdf'],
      run: () => {
        document
          .querySelector<HTMLAnchorElement>(`a[download][href="${portfolioData.resumeUrl}"]`)
          ?.click()
      },
    },
    ...portfolioData.contacts.map(({ href, label }) => ({
      id: `contact-${label.toLocaleLowerCase()}`,
      label: `Open ${label}`,
      keywords: ['contact', label.toLocaleLowerCase()],
      run: () => window.open(href, '_blank', 'noopener,noreferrer'),
    })),
    {
      id: 'shortcut-help',
      label: 'Show keyboard shortcuts',
      keywords: ['shortcut', 'help', 'keyboard', 'commands'],
      run: () => {
        window.alert(
          'Open commands with : or Command/Ctrl+K. Use the arrow keys to choose, Enter to run, and Escape to close.',
        )
      },
    },
  ]

  return (
    <>
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
      <CommandPalette commands={commands} />
    </>
  )
}
