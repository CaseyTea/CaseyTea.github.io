import type { PortfolioData, Project } from '../../data/types'
import type { BufferDefinition, BufferId, BufferRegistry } from './types'

function normalize(candidate: string): string {
  return candidate.trim().toLocaleLowerCase().replace(/^:e\s*/, '')
}

function createProjectBuffer(project: Project): BufferDefinition {
  const filename = `${project.id}.md`
  const path = `projects/${filename}`

  return {
    id: `project-${project.id}`,
    filename,
    path,
    kind: 'markdown',
    aliases: [filename, path, project.id, project.name],
    title: project.name,
    searchText: [
      project.name,
      project.outcome,
      project.context,
      project.contribution,
      ...(project.engineeringNotes ?? []),
      ...project.technologies,
    ].join(' '),
    projectId: project.id,
  }
}

export function createBufferRegistry(data: PortfolioData): BufferRegistry {
  const contentBuffers: BufferDefinition[] = [
    {
      id: 'readme',
      filename: 'README.md',
      path: 'README.md',
      kind: 'markdown',
      aliases: ['readme', 'README.md'],
      title: data.name,
      searchText: [data.name, data.title, data.introduction, data.location].join(' '),
    },
    {
      id: 'experience',
      filename: 'experience.log',
      path: 'experience.log',
      kind: 'log',
      aliases: ['experience', 'experience.log'],
      title: 'Experience',
      searchText: data.experience
        .flatMap((experience) => [
          experience.title,
          experience.organization,
          experience.dates,
          experience.summary,
          ...experience.highlights,
          ...experience.technologies,
        ])
        .join(' '),
    },
    ...data.projects.map(createProjectBuffer),
    {
      id: 'about',
      filename: 'about.md',
      path: 'about.md',
      kind: 'markdown',
      aliases: ['about', 'about.md'],
      title: 'About',
      searchText: [data.name, data.title, ...data.about, ...data.skillGroups.flatMap(({ skills }) => skills)].join(' '),
    },
    {
      id: 'contact',
      filename: 'contact.md',
      path: 'contact.md',
      kind: 'markdown',
      aliases: ['contact', 'contact.md'],
      title: 'Contact',
      searchText: [data.availability, data.location, ...data.contacts.flatMap(({ label, href }) => [label, href])].join(' '),
    },
  ]
  const primaryIds = contentBuffers.slice(0, 7).map(({ id }) => id)
  const buffers: BufferDefinition[] = [
    ...contentBuffers,
    {
      id: 'help',
      filename: 'help.txt',
      path: 'help.txt',
      kind: 'help',
      aliases: ['help', 'help.txt'],
      title: 'Help',
      searchText: [
        'Use keys 1 through 7 to open primary buffers.',
        ...contentBuffers
          .slice(0, 7)
          .map((buffer, index) => `${index + 1} ${buffer.filename}`),
        'Use tabs to cycle open buffers.',
      ].join(' '),
    },
  ]
  const byId = new Map<BufferId, BufferDefinition>(buffers.map((buffer) => [buffer.id, buffer]))

  return {
    defaultId: 'readme',
    primaryIds,
    byId,
    resolve(candidate) {
      const normalizedCandidate = normalize(candidate)
      const match = buffers.find((buffer) =>
        [buffer.id, buffer.filename, buffer.path, ...buffer.aliases]
          .map(normalize)
          .includes(normalizedCandidate),
      )

      return match?.id ?? null
    },
  }
}
