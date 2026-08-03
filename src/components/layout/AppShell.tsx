import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { portfolioData } from '../../data/portfolio'
import { ProfileRail } from './ProfileRail'
import { StatusLine } from './StatusLine'

function getActiveSection() {
  const currentHash = window.location.hash

  return (
    portfolioData.navItems.find(({ href }) => href === currentHash) ?? portfolioData.navItems[0]
  )
}

export function AppShell({ children }: PropsWithChildren) {
  const [activeSection, setActiveSection] = useState(getActiveSection)

  useEffect(() => {
    function handleHashChange() {
      setActiveSection(getActiveSection())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="app-shell">
        <ProfileRail activeHref={activeSection.href} />

        <div className="app-shell__workspace">
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <StatusLine activeSection={activeSection.label} />
        </div>
      </div>
    </>
  )
}
