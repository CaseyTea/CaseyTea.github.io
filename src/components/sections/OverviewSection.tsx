import type { Metric, Project } from '../../data/types'

type OverviewSectionProps = {
  introduction: string
  metrics: Metric[]
  featuredProject: Project
  resumeUrl: string
}

export function OverviewSection({
  introduction,
  metrics,
  featuredProject,
  resumeUrl,
}: OverviewSectionProps) {
  return (
    <section className="intro-panel" id="overview" aria-labelledby="overview-heading" tabIndex={-1}>
      <p className="section-eyebrow">Software developer / problem solver</p>
      <h2 id="overview-heading">Software that makes useful work easier.</h2>
      <p className="intro-panel__lede">{introduction}</p>

      <div className="intro-panel__actions" aria-label="Overview actions">
        <a className="button-link button-link--filled" href="#experience">
          View experience
        </a>
        <a className="button-link" href={resumeUrl} download>
          Download resume
        </a>
      </div>

      <dl className="intro-panel__metrics" aria-label="Career highlights">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <dt>{value}</dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>

      <a className="featured-preview" href={`#project-${featuredProject.id}`}>
        <span className="featured-preview__label">Featured work</span>
        <strong>{featuredProject.name}</strong>
        <span>{featuredProject.outcome}</span>
      </a>
    </section>
  )
}
