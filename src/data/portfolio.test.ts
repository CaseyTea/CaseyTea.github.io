import { portfolioData } from './portfolio'

test('provides unique experience and project identifiers for keyed portfolio sections', () => {
  const experienceIds = portfolioData.experience.map(({ id }) => id)
  const projectIds = portfolioData.projects.map(({ id }) => id)

  expect(new Set(experienceIds)).toHaveLength(experienceIds.length)
  expect(new Set(projectIds)).toHaveLength(projectIds.length)
})

test('includes highlights for every experience entry', () => {
  expect(portfolioData.experience.every(({ highlights }) => highlights.length > 0)).toBe(true)
})

test('includes technologies for every project entry', () => {
  expect(portfolioData.projects.every(({ technologies }) => technologies.length > 0)).toBe(true)
})

test('presents exactly three verified overview metrics', () => {
  expect(portfolioData.metrics).toHaveLength(3)
})

test('provides the verified location used by the contact section', () => {
  expect(portfolioData.location).toBe('Westminster, California')
})
