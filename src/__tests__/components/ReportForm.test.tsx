import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import ReportForm from '@/components/reports/ReportForm'
import { AdminRole } from '@prisma/client' // Import AdminRole

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}))



const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'test-image.jpg',
    role: AdminRole.SUPERADMIN, // Use AdminRole enum
    permissions: {},
  },
  expires: '1',
}

describe('ReportForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders create form correctly', async () => {
    await act(async () => {
      render(
        <SessionProvider session={mockSession}>
          <ReportForm />
        </SessionProvider>
      )
    })

    // Explicitly wait for categories to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText(/Categories/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('textbox', { name: 'Title *' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Description *' })).toBeInTheDocument()
    expect(screen.getByText(/Create Report/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    await act(async () => {
      render(
        <SessionProvider session={mockSession}>
          <ReportForm />
        </SessionProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/Categories/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Title *' }), {
      target: { value: 'Test Report' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Description *' }), {
      target: { value: 'This is a test description for the report.' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Meta Title *' }), {
      target: { value: 'Test Meta Title' },
    })
    await act(async () => {
      fireEvent.click(screen.getByText(/Create Report/i))
    })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/reports', expect.any(Object))
    })
  })

  it('shows validation errors for empty required fields', async () => {
    await act(async () => {
      render(
        <SessionProvider session={mockSession}>
          <ReportForm />
        </SessionProvider>
      )
    })

    fireEvent.change(screen.getByRole('textbox', { name: 'Title *' }), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Description *' }), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Meta Title *' }), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Meta Description *' }), {
      target: { value: '' },
    })

    await act(async () => {
      fireEvent.click(screen.getByText(/Create Report/i))
    })

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/Description must be at least 20 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/Meta title must be at least 5 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/Meta description must be at least 10 characters/i)).toBeInTheDocument()
    })
  })
})
