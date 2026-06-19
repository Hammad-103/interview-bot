import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RoleSelector from '../components/RoleSelector'

describe('RoleSelector', () => {

  it('renders all 6 role cards', () => {
    render(<RoleSelector onStart={vi.fn()} />)
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument()
    expect(screen.getByText('Backend Dev')).toBeInTheDocument()
    expect(screen.getByText('Data Science')).toBeInTheDocument()
    expect(screen.getByText('Product Manager')).toBeInTheDocument()
    expect(screen.getByText('UI/UX Designer')).toBeInTheDocument()
    expect(screen.getByText('HR / Behavioral')).toBeInTheDocument()
  })

  it('start button is disabled when no role selected', () => {
    render(<RoleSelector onStart={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /select a role to begin/i })
    expect(btn).toBeDisabled()
  })

  it('start button enables after role is selected', () => {
    render(<RoleSelector onStart={vi.fn()} />)
    fireEvent.click(screen.getByText('Frontend Dev'))
    const btn = screen.getByRole('button', { name: /start frontend dev interview/i })
    expect(btn).not.toBeDisabled()
  })

  it('calls onStart with correct config when started', () => {
    const onStart = vi.fn()
    render(<RoleSelector onStart={onStart} />)
    fireEvent.click(screen.getByText('Frontend Dev'))
    fireEvent.click(screen.getByRole('button', { name: /start frontend dev interview/i }))
    expect(onStart).toHaveBeenCalledWith({ role: 'Frontend Dev', level: 'Junior' })
  })

  it('level changes when clicked', () => {
    render(<RoleSelector onStart={vi.fn()} />)
    fireEvent.click(screen.getByText('Mid'))
    fireEvent.click(screen.getByText('Frontend Dev'))
    const btn = screen.getByRole('button', { name: /start frontend dev interview/i })
    fireEvent.click(btn)
  })

})