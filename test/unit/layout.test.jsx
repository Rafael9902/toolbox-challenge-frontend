import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

import { render, screen } from '@testing-library/react'

import { Layout } from '../../src/shared/components/Layout.jsx'

const SRC = join(__dirname, '..', '..', 'src')
const BOOTSTRAP_STYLESHEET = 'bootstrap/dist/css/bootstrap.min.css'

const filesUnder = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? filesUnder(full) : [full]
  })

describe('Layout', () => {
  it('shows the application title in the top bar', () => {
    render(<Layout>content</Layout>)

    expect(screen.getByRole('heading', { name: 'React Test App' })).toBeInTheDocument()
  })

  it('paints the bar with the colour the wireframe fixes', () => {
    const { container } = render(<Layout>content</Layout>)

    expect(container.querySelector('nav')).toHaveClass('app-bar')
  })

  it('renders the children inside the content container', () => {
    render(<Layout>content</Layout>)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('container-fluid')
    expect(main).toContainElement(screen.getByText('content'))
  })

  it('spans the viewport, as the wireframe shows, at every width', () => {
    // The wireframe puts the table nearly edge to edge, so the content is not
    // capped to a column: `container-fluid` is the Bootstrap layout that keeps
    // the padding responsive without constraining the width.
    render(<Layout>content</Layout>)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('container-fluid')
    expect(main.className).not.toMatch(/\bcol(-|$)/)
    expect(main.querySelector('.row')).toBeNull()
  })

  it('adds no styling of its own on top of Bootstrap', () => {
    const { container } = render(<Layout>content</Layout>)

    expect(container.querySelector('style')).toBeNull()
    expect(container.querySelector('[style]')).toBeNull()
  })
})

describe('styling sources', () => {
  it('ships a single stylesheet, for the one colour Bootstrap does not carry', () => {
    // The wireframe fixes the bar at #ff6666 and Bootstrap has no such token.
    // Everything else still comes from the library, so one file is the budget.
    const stylesheets = filesUnder(SRC).filter((file) => file.endsWith('.css'))

    expect(stylesheets).toHaveLength(1)
    expect(stylesheets[0]).toMatch(/layout\.css$/)
  })

  it('imports the Bootstrap stylesheet once, from the entry point', () => {
    const importers = filesUnder(SRC).filter((file) =>
      readFileSync(file, 'utf8').includes(BOOTSTRAP_STYLESHEET)
    )

    expect(importers).toEqual([join(SRC, 'index.jsx')])
  })
})
