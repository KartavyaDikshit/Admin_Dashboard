'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  userRole?: string
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: false },
  { name: 'AI Generation', href: '/admin/ai-generation', icon: CpuChipIcon, current: false },
  { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon, current: false, badge: '2,338' },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon, current: false, badge: '10' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon, current: false, badge: '17' },
  { name: 'Requests', href: '/admin/requests', icon: ChatBubbleLeftRightIcon, current: false, badge: '655' },
  { name: 'Translations', href: '/admin/translations', icon: GlobeAltIcon, current: false },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon, current: false },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, current: false },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, current: false }
]

export default function Sidebar({ open, setOpen, userRole }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => {
    // Add role-based filtering logic here
    if (userRole === 'EDITOR' && ['Users', 'Settings'].includes(item.name)) {
      return false
    }
    return true
  })

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
      open ? 'translate-x-0' : '-translate-x-48'
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TBI</span>
            </div>
            <div className="ml-3">
              <p className="text-lg font-semibold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">The Brainy Insights</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    isActive 
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Logged in as <span className="font-medium">{userRole}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
