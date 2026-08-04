import type { PortfolioData, Project } from '../../data/types'
import type { BufferDefinition, BufferId } from '../buffers/types'
import type { DocumentAction, DocumentActions, DocumentLine } from './types'

type AddLine = (
  searchText: string,
  content: React.ReactNode,
  action?: DocumentAction,
) => DocumentLine

function createLineBuilder(bufferId: BufferId) {
  const lines: DocumentLine[] = []

  const addLine: AddLine = (searchText, content, action) => {
    const number = lines.length + 1
    const line: DocumentLine = {
      id: `${bufferId}-line-${number}`,
      number,
      searchText,
      content,
      ...(action ? { action } : {}),
    }
    lines.push(line)
    return line
  }

  return { addLine, lines }
}

function externalLinkProps(href: string) {
  return href.startsWith('http')
    ? { target: '_blank', rel: 'noreferrer' }
    : {}
}

function createReadmeLines(data: PortfolioData, actions: DocumentActions): DocumentLine[] {
  const { addLine, lines } = createLineBuilder('readme')
  const firstProjectId = data.projects[0] ? (`project-${data.projects[0].id}` as const) : 'readme'

  addLine(data.name, <h1>{data.name}</h1>)
  addLine(data.title, <p className="document-lede">{data.title}</p>)
  addLine(data.introduction, <p>{data.introduction}</p>)
  addLine(
    data.metrics.flatMap(({ label, value }) => [value, label]).join(' '),
    <dl className="document-metrics" role="list" aria-label="Career impact">
      {data.metrics.map(({ label, value }) => (
        <div key={label} className="document-metrics__item">
          <dt>{value}</dt>
          <dd>{label}</dd>
        </div>
      ))}
    </dl>,
  )
  addLine('Portfolio navigation', <h2>Start here</h2>)
  addLine(
    'View experience career work history',
    <button type="button" className="document-action" onClick={() => actions.openBuffer('experience')}>
      View experience
    </button>,
    { label: 'Open experience', run: () => actions.openBuffer('experience') },
  )
  addLine(
    `Browse projects ${data.projects.map(({ name }) => name).join(' ')}`,
    <button type="button" className="document-action" onClick={() => actions.openBuffer(firstProjectId)}>
      Browse projects
    </button>,
    { label: 'Open projects', run: () => actions.openBuffer(firstProjectId) },
  )
  addLine(
    'Download resume PDF',
    <a className="document-action document-action--primary" href={data.resumeUrl} download>
      Download resume
    </a>,
    { label: 'Download resume', run: actions.downloadResume },
  )
  addLine(
    'Editor shortcuts are optional. Mouse touch keyboard Tab Enter',
    <p className="document-note">
      Editor shortcuts are optional. Every file and action also works with mouse, touch, Tab,
      and Enter.
    </p>,
  )

  return lines
}

function createExperienceLines(data: PortfolioData): DocumentLine[] {
  const { addLine, lines } = createLineBuilder('experience')

  addLine('Experience', <h1>Experience</h1>)
  data.experience.forEach((experience) => {
    addLine(experience.title, <h2>{experience.title}</h2>)
    addLine(
      `${experience.organization} ${experience.dates}`,
      <p className="document-byline">
        <span>{experience.organization}</span>
        <span aria-hidden="true"> · </span>
        <time>{experience.dates}</time>
      </p>,
    )
    addLine(experience.summary, <p>{experience.summary}</p>)
    addLine(
      experience.highlights.join(' '),
      <ul>
        {experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
      </ul>,
    )
    addLine(
      experience.technologies.join(' '),
      <p className="document-stack">
        <strong>Stack:</strong> {experience.technologies.join(' · ')}
      </p>,
    )
  })

  return lines
}

function createProjectLines(
  buffer: BufferDefinition,
  project: Project,
  actions: DocumentActions,
): DocumentLine[] {
  const { addLine, lines } = createLineBuilder(buffer.id)

  addLine(project.name, <h1>{project.name}</h1>)
  addLine(
    `${project.kind} ${project.outcome} ${project.context} ${project.contribution}`,
    <dl className="document-metadata">
      <div>
        <dt>Type</dt>
        <dd>{project.kind === 'professional' ? 'Professional work' : 'Side project'}</dd>
      </div>
      <div>
        <dt>Outcome</dt>
        <dd>{project.outcome}</dd>
      </div>
      <div>
        <dt>Context</dt>
        <dd>{project.context}</dd>
      </div>
      <div>
        <dt>Contribution</dt>
        <dd>{project.contribution}</dd>
      </div>
    </dl>,
  )
  if (project.image) {
    addLine(
      `${project.name} project preview`,
      <figure className="document-project-image">
        <img src={project.image} alt={`${project.name} project preview`} />
      </figure>,
    )
  }
  if (project.engineeringNotes?.length) {
    addLine('Engineering notes', <h2>Engineering notes</h2>)
    addLine(
      project.engineeringNotes.join(' '),
      <ul>
        {project.engineeringNotes.map((note) => <li key={note}>{note}</li>)}
      </ul>,
    )
  }
  addLine('Technologies', <h2>Technologies</h2>)
  addLine(
    project.technologies.join(' '),
    <ul className="document-tags" aria-label={`${project.name} technologies`}>
      {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
    </ul>,
  )
  if (project.demoUrl) {
    const href = project.demoUrl
    addLine(
      'View live project demo',
      <a className="document-action document-action--primary" href={href} {...externalLinkProps(href)}>
        View live project
      </a>,
      { label: 'Open live project', run: () => actions.openLink(href) },
    )
  }
  if (project.sourceUrl) {
    const href = project.sourceUrl
    addLine(
      'View project source repository',
      <a className="document-action" href={href} {...externalLinkProps(href)}>
        View source
      </a>,
      { label: 'Open project source', run: () => actions.openLink(href) },
    )
  }

  return lines
}

function createAboutLines(data: PortfolioData, actions: DocumentActions): DocumentLine[] {
  const { addLine, lines } = createLineBuilder('about')

  addLine(`About ${data.name}`, <h1>About {data.name}</h1>)
  addLine(data.introduction, <p>{data.introduction}</p>)
  data.about.forEach((paragraph) => addLine(paragraph, <p>{paragraph}</p>))
  addLine('Skills and tools', <h2>Skills and tools</h2>)
  data.skillGroups.forEach((group) => {
    addLine(group.title, <h3>{group.title}</h3>)
    addLine(
      group.skills.join(' '),
      <ul className="document-tags" aria-label={`${group.title} skills`}>
        {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>,
    )
  })
  addLine(
    'Contact',
    <button type="button" className="document-action" onClick={() => actions.openBuffer('contact')}>
      Get in touch
    </button>,
    { label: 'Open contact', run: () => actions.openBuffer('contact') },
  )

  return lines
}

function createContactLines(data: PortfolioData, actions: DocumentActions): DocumentLine[] {
  const { addLine, lines } = createLineBuilder('contact')

  addLine('Contact', <h1>Contact</h1>)
  addLine(data.availability, <p>{data.availability}</p>)
  addLine(data.location, <p>{data.location}</p>)
  data.contacts.forEach((contact) => {
    const { href, label } = contact
    addLine(
      `${label} ${href}`,
      <a className="document-contact-link" href={href} {...externalLinkProps(href)}>
        {label}
      </a>,
      { label: `Open ${label}`, run: () => actions.openLink(href) },
    )
  })
  addLine(
    'Download resume PDF',
    <a className="document-action document-action--primary" href={data.resumeUrl} download>
      Download resume
    </a>,
    { label: 'Download resume', run: actions.downloadResume },
  )

  return lines
}

function createHelpLines(data: PortfolioData, actions: DocumentActions): DocumentLine[] {
  const { addLine, lines } = createLineBuilder('help')
  const availableBuffers: Array<{ id: BufferId; label: string }> = [
    { id: 'readme', label: 'README.md' },
    { id: 'experience', label: 'experience.log' },
    ...data.projects.map((project) => ({
      id: `project-${project.id}` as BufferId,
      label: `projects/${project.id}.md`,
    })),
    { id: 'about', label: 'about.md' },
    { id: 'contact', label: 'contact.md' },
  ]
  const primaryBuffers = availableBuffers.slice(0, 7)

  addLine('Help', <h1>Help</h1>)
  addLine(
    'Mouse touch Tab Enter conventional navigation',
    <p>Use the file explorer with mouse, touch, Tab, and Enter. Editor shortcuts are optional.</p>,
  )
  addLine('Primary buffers shortcuts 1–7', <h2>Primary buffers: 1–7</h2>)
  primaryBuffers.forEach(({ id, label }, index) => {
    addLine(
      `${index + 1} ${label}`,
      <button type="button" className="document-help-link" onClick={() => actions.openBuffer(id)}>
        <kbd>{index + 1}</kbd> {label}
      </button>,
      { label: `Open ${label}`, run: () => actions.openBuffer(id) },
    )
  })
  addLine('Optional editor shortcuts', <h2>Optional editor shortcuts</h2>)
  addLine(
    'j / k Ctrl+d Ctrl+u gg / G gt / gT Enter',
    <dl className="document-shortcuts">
      <div><dt>j / k</dt><dd>Move one line</dd></div>
      <div><dt>Ctrl+d / Ctrl+u</dt><dd>Move half a page</dd></div>
      <div><dt>gg / G</dt><dd>Move to the first or last line</dd></div>
      <div><dt>gt / gT</dt><dd>Cycle open buffers</dd></div>
      <div><dt>Enter</dt><dd>Run the active line action</dd></div>
    </dl>,
  )
  addLine(
    ': or Command/Ctrl+K commands / search',
    <p>
      Open commands with <kbd>:</kbd> or <kbd>Command/Ctrl+K</kbd>. Use <kbd>/</kbd> to search
      the current buffer.
    </p>,
  )

  return lines
}

export function createDocumentLines(
  buffer: BufferDefinition,
  data: PortfolioData,
  actions: DocumentActions,
): DocumentLine[] {
  if (buffer.id === 'readme') return createReadmeLines(data, actions)
  if (buffer.id === 'experience') return createExperienceLines(data)
  if (buffer.id === 'about') return createAboutLines(data, actions)
  if (buffer.id === 'contact') return createContactLines(data, actions)
  if (buffer.id === 'help') return createHelpLines(data, actions)

  const project = data.projects.find(({ id }) => id === buffer.projectId)
  return project ? createProjectLines(buffer, project, actions) : []
}
