import type { Project } from '../../data/types'

type ProjectsSectionProps = {
  projects: Project[]
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card" id={`project-${project.id}`}>
      {project.image ? (
        <img
          className="project-card__image"
          src={project.image}
          alt={`${project.name} project preview`}
          loading="lazy"
        />
      ) : null}

      <div className="project-card__content">
        <h4>{project.name}</h4>
        <p className="project-card__outcome">{project.outcome}</p>
        <p>{project.context}</p>
        <p>
          <strong>Contribution:</strong> {project.contribution}
        </p>

        <ul className="tag-list" aria-label={`${project.name} technologies`}>
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>

        {project.sourceUrl || project.demoUrl ? (
          <div className="project-card__links">
            {project.sourceUrl ? (
              <a href={project.sourceUrl} target="_blank" rel="noreferrer">
                View source
              </a>
            ) : null}
            {project.demoUrl ? (
              <a href={project.demoUrl} target="_blank" rel="noreferrer">
                View live project
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ProjectGroup({ projects, title }: { projects: Project[]; title: string }) {
  if (projects.length === 0) return null

  return (
    <div className="project-group">
      <h3>{title}</h3>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </div>
    </div>
  )
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const professionalProjects = projects.filter(({ kind }) => kind === 'professional')
  const sideProjects = projects.filter(({ kind }) => kind === 'side-project')

  return (
    <section
      className="portfolio-section"
      id="projects"
      aria-labelledby="projects-heading"
      tabIndex={-1}
    >
      <div className="section-heading">
        <p className="section-eyebrow">Case studies / Work</p>
        <h2 id="projects-heading">Selected projects</h2>
        <p>A mix of production systems and smaller builds made to explore an idea.</p>
      </div>

      <ProjectGroup title="Professional work" projects={professionalProjects} />
      <ProjectGroup title="Side projects" projects={sideProjects} />
    </section>
  )
}
