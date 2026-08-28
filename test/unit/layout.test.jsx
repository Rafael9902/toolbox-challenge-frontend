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
    expect(screen.getByRole('navigation')).toHaveClass('navbar')
  })

  it('renders the children inside a centered container', () => {
    render(<Layout>content</Layout>)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('container')
    expect(main).toContainElement(screen.getByText('content'))
  })

  it('lays the content out on the responsive Bootstrap grid', () => {
    render(<Layout>content</Layout>)

    const row = screen.getByRole('main').querySelector('.row')
    expect(row).toBeInTheDocument()

    const column = row.firstElementChild
    expect(column).toHaveClass('col-12')
    expect(column).toHaveClass('col-xl-10')
    expect(column).toContainElement(screen.getByText('content'))
  })

  it('adds no styling of its own on top of Bootstrap', () => {
    const { container } = render(<Layout>content</Layout>)

    expect(container.querySelector('style')).toBeNull()
    expect(container.querySelector('[style]')).toBeNull()
  })
})

describe('styling sources', () => {
  it('ships no stylesheet of its own, so every style comes from Bootstrap', () => {
    expect(filesUnder(SRC).filter((file) => file.endsWith('.css'))).toEqual([])
  })

  it('imports the Bootstrap stylesheet once, from the entry point', () => {
    const importers = filesUnder(SRC).filter((file) =>
      readFileSync(file, 'utf8').includes(BOOTSTRAP_STYLESHEET)
    )

    expect(importers).toEqual([join(SRC, 'index.jsx')])
  })
})
