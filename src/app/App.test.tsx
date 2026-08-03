import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders Casey’s role and résumé link', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /Casey Franceschy/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /download résumé/i })).toHaveAttribute(
    'href',
    '/assets/Casey_Franceschy.pdf',
  )
})
