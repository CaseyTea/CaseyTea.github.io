import { useState } from 'react'
import type { Experience } from '../../data/types'

type ExperienceSectionProps = {
  experiences: Experience[]
}

function ExperienceEntry({ experience }: { experience: Experience }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const headingId = `${experience.id}-heading`
  const detailsId = `${experience.id}-details`

  return (
    <article className="experience-card" aria-labelledby={headingId}>
      <div className="experience-card__header">
        <div>
          <p className="experience-card__organization">{experience.organization}</p>
          <h3 id={headingId}>{experience.title}</h3>
        </div>
        <p className="experience-card__dates">{experience.dates}</p>
      </div>

      <p className="experience-card__summary">{experience.summary}</p>

      <button
        className="disclosure-button"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? 'Hide details' : 'View details'}
        <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
      </button>

      <div className="experience-card__details" id={detailsId} hidden={!isExpanded}>
        <ul>
          {experience.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <ul className="tag-list" aria-label={`${experience.title} technologies`}>
          {experience.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section className="portfolio-section" id="experience" aria-labelledby="experience-heading">
      <div className="section-heading">
        <p className="section-eyebrow">Résumé / Experience</p>
        <h2 id="experience-heading">Experience</h2>
        <p>Roles where software, systems, and thoughtful support turned into measurable outcomes.</p>
      </div>

      <div className="experience-list">
        {experiences.map((experience) => (
          <ExperienceEntry experience={experience} key={experience.id} />
        ))}
      </div>
    </section>
  )
}
