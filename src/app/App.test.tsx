import { render, screen } from '@testing-library/react'
import { App } from './App'

const sectionLinks = [
  ['About', '#about'],
  ['Experience', '#experience'],
  ['Projects', '#projects'],
  ['Contact', '#contact'],
] as const

test('renders Casey’s role and résumé link', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /Casey Franceschy/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /download résumé/i })).toHaveAttribute(
    'href',
    '/assets/Casey_Franceschy.pdf',
  )
})

test('provides semantic landmarks and accessible portfolio navigation', () => {
  render(<App />)

  expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
    'href',
    '#main-content',
  )
  expect(screen.getByRole('banner')).toBeVisible()
  expect(screen.getByRole('navigation', { name: 'Portfolio sections' })).toBeVisible()
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  expect(screen.getByRole('contentinfo')).toBeVisible()

  sectionLinks.forEach(([label, href]) => {
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    expect(screen.getByRole('link', { name: label })).toBeVisible()
  })
})

test('identifies Casey and labels the professional profile links', () => {
  render(<App />)

  expect(screen.getByRole('img', { name: /Casey Franceschy/i })).toHaveAttribute(
    'src',
    '/assets/my-memoji.png',
  )
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/CaseyTea',
  )
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/casey-franceschy-694823124/',
  )
})
