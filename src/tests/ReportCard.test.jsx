import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportCard from '../components/ReportCard'

const mockResults = (scores, answers) => ({
  questions: [
    'What is the difference between var, let, and const?',
    'Explain the CSS box model.',
    'What is the difference between == and ===?',
    'What is a Promise in JavaScript?',
    'How does the browser render a webpage?'
  ],
  answers: answers || [
    'var is function scoped, let and const are block scoped',
    'The box model includes margin, border, padding and content',
    '[Skipped]',
    'A promise is an async operation that resolves or rejects',
    '[Skipped]'
  ],
  scores: scores || [7, 6, 0, 5, 0]
})

const mockConfig = { role: 'Frontend Dev', level: 'Junior' }

describe('ReportCard', () => {

  it('renders Performance Dashboard heading', () => {
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument()
  })

 it('shows correct percentage score', () => {
  render(
    <ReportCard
      results={mockResults([7, 6, 0, 5, 0])}
      config={mockConfig}
      onRetry={vi.fn()}
      onRetrySameRole={vi.fn()}
    />
  )
  const elements = screen.getAllByText('40%')
  expect(elements.length).toBeGreaterThan(0)
})

  it('shows 0% when all skipped', () => {
    render(
      <ReportCard
        results={mockResults([0, 0, 0, 0, 0])}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows Excellent grade for 100% score', () => {
    render(
      <ReportCard
        results={mockResults([9, 9, 9, 9, 9], ['a', 'b', 'c', 'd', 'e'])}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('shows Needs Work grade for 0%', () => {
    render(
      <ReportCard
        results={mockResults([0, 0, 0, 0, 0])}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('Needs Work')).toBeInTheDocument()
  })

  it('shows skipped warning for skipped answers', () => {
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    const skipped = screen.getAllByText(/skipped/i)
    expect(skipped.length).toBeGreaterThan(0)
  })

  it('shows correct role and level in sub heading', () => {
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('Frontend Dev · Junior Level')).toBeInTheDocument()
  })

  it('shows correct answered count', () => {
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={vi.fn()}
      />
    )
    expect(screen.getByText('Answered')).toBeInTheDocument()
  })

  it('calls onRetry when Try Another Role clicked', () => {
    const onRetry = vi.fn()
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={onRetry}
        onRetrySameRole={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Try Another Role'))
    expect(onRetry).toHaveBeenCalled()
  })

  it('calls onRetrySameRole when Same Role clicked', () => {
    const onRetrySameRole = vi.fn()
    render(
      <ReportCard
        results={mockResults()}
        config={mockConfig}
        onRetry={vi.fn()}
        onRetrySameRole={onRetrySameRole}
      />
    )
    fireEvent.click(screen.getByText('Same Role'))
    expect(onRetrySameRole).toHaveBeenCalled()
  })

})