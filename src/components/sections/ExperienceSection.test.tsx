import { fireEvent, render, screen, within } from '@testing-library/react'
import { portfolioData } from '../../data/portfolio'
import { ExperienceSection } from './ExperienceSection'

test('keeps experience details collapsed until their disclosure button is used', () => {
  render(<ExperienceSection experiences={portfolioData.experience} />)

  const firstExperience = screen.getByRole('article', {
    name: 'Analyst 1: Programmer (Part-Time)',
  })
  const disclosure = within(firstExperience).getByRole('button', { name: /view details/i })

  expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  expect(disclosure).toHaveAttribute('aria-controls', 'analyst-programmer-details')
  expect(screen.queryByText(/Developed a modular \.NET 8 Minimal API/i)).not.toBeInTheDocument()

  fireEvent.click(disclosure)

  expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  expect(disclosure).toHaveAccessibleName(/hide details/i)
  expect(screen.getByText(/Developed a modular \.NET 8 Minimal API/i)).toBeVisible()
  expect(document.getElementById('analyst-programmer-details')).toBeVisible()
})

test('gives each experience disclosure its own controlled detail region', () => {
  render(<ExperienceSection experiences={portfolioData.experience} />)

  const disclosures = screen.getAllByRole('button', { name: /view details/i })
  const controlledIds = disclosures.map((button) => button.getAttribute('aria-controls'))

  expect(new Set(controlledIds).size).toBe(portfolioData.experience.length)

  fireEvent.click(disclosures[1])

  expect(disclosures[0]).toHaveAttribute('aria-expanded', 'false')
  expect(disclosures[1]).toHaveAttribute('aria-expanded', 'true')
})
