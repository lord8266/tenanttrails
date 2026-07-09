import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReviewCard from '../components/ReviewCard'

describe('ReviewCard', () => {
  it('renders the review body', () => {
    render(
      <ReviewCard
        rating={4}
        body="Great building."
        date="2026-04-02"
        author="James"
      />
    )
    expect(screen.getByText('Great building.')).toBeInTheDocument()
  })

  it('renders the correct number of stars', () => {
    render(<ReviewCard rating={3} body="OK" date="2026-01-01" author="A" />)
    const stars = screen.getAllByText('★')
    expect(stars.length).toBe(3)
  })
})
