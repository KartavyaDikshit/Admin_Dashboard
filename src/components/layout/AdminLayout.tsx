'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { Toaster } from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        userRole={session?.user?.role}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={session?.user}
        />
        
        <main className="flex-1 overflow-auto bg-gray-50 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}
