import type { SkillGroup } from '../../data/types'

type SkillsSectionProps = {
  skillGroups: SkillGroup[]
}

export function SkillsSection({ skillGroups }: SkillsSectionProps) {
  return (
    <section className="portfolio-section" id="skills" aria-labelledby="skills-heading">
      <div className="section-heading">
        <p className="section-eyebrow">Working toolkit</p>
        <h2 id="skills-heading">Skills</h2>
        <p>Technologies used across the roles and projects above, grouped by the work they support.</p>
      </div>

      <div className="skills-grid">
        {skillGroups.map(({ skills, title }) => (
          <article className="skill-group" key={title}>
            <h3>{title}</h3>
            <ul className="tag-list">
              {skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
