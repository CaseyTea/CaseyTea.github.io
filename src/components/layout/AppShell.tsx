import type { PropsWithChildren } from 'react'
import { portfolioData } from '../../data/portfolio'
import { ProfileRail } from './ProfileRail'
import { StatusLine } from './StatusLine'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="app-shell">
        <ProfileRail />

        <div className="app-shell__workspace">
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <StatusLine activeSection={portfolioData.navItems[0].label} />
        </div>
      </div>
    </>
  )
}
