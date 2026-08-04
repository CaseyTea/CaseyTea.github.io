import type { Contact } from '../../data/types'

type ContactSectionProps = {
  contacts: Contact[]
  location: string
  resumeUrl: string
}

export function ContactSection({ contacts, location, resumeUrl }: ContactSectionProps) {
  return (
    <section
      className="portfolio-section contact-section"
      id="contact"
      aria-labelledby="contact-heading"
      tabIndex={-1}
    >
      <div className="section-heading">
        <p className="section-eyebrow">Contact</p>
        <h2 id="contact-heading">Let’s work together.</h2>
        <p>
          I’m interested in software teams that care about useful systems, clear collaboration, and
          learning while they build.
        </p>
      </div>

      <div className="contact-grid">
        {contacts.map(({ href, label }) => (
          <a className="contact-card" href={href} key={label}>
            <span>{label}</span>
            <strong>{label === 'Email' ? 'Send a message' : `Visit ${label}`}</strong>
          </a>
        ))}
        <div className="contact-card contact-card--static">
          <span>Location</span>
          <address>{location}</address>
        </div>
        <a className="contact-card" href={resumeUrl} download>
          <span>Resume</span>
          <strong>Download PDF</strong>
        </a>
      </div>
    </section>
  )
}
