import { portfolioData } from '../../data/portfolio'
import type { NavItem } from '../../data/types'

function SectionLink({ href, label }: NavItem) {
  return (
    <li>
      <a className="profile-rail__nav-link" href={href}>
        <span aria-hidden="true">/</span>
        {label}
      </a>
    </li>
  )
}

export function ProfileRail() {
  return (
    <header className="profile-rail">
      <div className="profile-rail__identity">
        <img
          className="profile-rail__avatar"
          src={portfolioData.avatarUrl}
          alt={`Illustrated avatar of ${portfolioData.name}`}
          width="144"
          height="144"
        />

        <div className="profile-rail__heading">
          <p className="profile-rail__eyebrow">Portfolio / Resume</p>
          <h1>{portfolioData.name}</h1>
          <p className="profile-rail__role">{portfolioData.title}</p>
        </div>
      </div>

      <nav className="profile-rail__nav" aria-label="Portfolio sections">
        <ul>
          {portfolioData.navItems.map((item) => (
            <SectionLink key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      <div className="profile-rail__actions">
        <a className="button-link" href={portfolioData.resumeUrl} download>
          Download resume
        </a>

        <ul className="profile-rail__contacts" aria-label="Professional profiles">
          {portfolioData.contacts.map(({ href, label }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
