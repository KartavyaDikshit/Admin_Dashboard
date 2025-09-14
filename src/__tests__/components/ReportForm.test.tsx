import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import ReportForm from '@/components/reports/ReportForm'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

// Mock API calls
global.fetch = jest.fn()

const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    role: 'SUPERADMIN'
  }
}

describe('ReportForm', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders create form correctly', () => {
    render(
      <SessionProvider session={mockSession}>
        <ReportForm />
      </SessionProvider>
    )

    expect(screen.getByText('Create New Report')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, report: { id: '1' } })
    })

    render(
      <SessionProvider session={mockSession}>
        <ReportForm />
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Report' }
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This is a test report description that is long enough.' }
    })
    fireEvent.change(screen.getByLabelText(/meta title/i), {
      target: { value: 'Test Report Meta Title' }
    })
    fireEvent.change(screen.getByLabelText(/meta description/i), {
      target: { value: 'Test meta description for SEO purposes.' }
    })

    fireEvent.click(screen.getByRole('button', { name: /create report/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Report')
      })
    })
  })

  it('shows validation errors for empty required fields', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ReportForm />
      </SessionProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /create report/i }))

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument()
    })
  })
})
