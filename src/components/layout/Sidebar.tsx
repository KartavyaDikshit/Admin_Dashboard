'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  CpuChipIcon,
  NewspaperIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Dispatch, SetStateAction } from 'react' // Import Dispatch and SetStateAction

interface SidebarProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>> // Add setOpen property
  userRole?: string
}

export default function Sidebar({ open, userRole }: SidebarProps) {
  const pathname = usePathname()

  const { data: reportsCount } = useQuery<number>({ queryKey: ['reportsCount'], queryFn: async () => {
    try {
      const response = await axios.get('/api/reports?countOnly=true');
      return response?.data?.count ?? 0;
    } catch (error) {
      console.error('Failed to fetch reports count', error);
      return 0;
    }
  }});

  const { data: pressReleasesCount } = useQuery<number>({ queryKey: ['pressReleasesCount'], queryFn: async () => {
    try {
      const response = await axios.get('/api/press-releases?countOnly=true'); // Assuming this endpoint supports countOnly or you might need to implement it
      return response?.data?.total ?? 0; // Or however your API returns the count for list endpoints
    } catch (error) {
      // Fail silently or log
      return 0;
    }
  }});

  const { data: ordersCount } = useQuery<number>({ queryKey: ['ordersCount'], queryFn: async () => {
    try {
      const response = await axios.get('/api/orders?countOnly=true');
      return response?.data?.count ?? 0;
    } catch (error) {
      console.error('Failed to fetch orders count', error);
      return 0;
    }
  }});

  const { data: requestsCount } = useQuery<number>({ queryKey: ['requestsCount'], queryFn: async () => {
    try {
      const response = await axios.get('/api/requests?countOnly=true');
      return response?.data?.count ?? 0;
    } catch (error) {
      console.error('Failed to fetch requests count', error);
      return 0;
    }
  }});

  const { data: categoriesCount } = useQuery<number>({ queryKey: ['categoriesCount'], queryFn: async () => {
    try {
      const response = await axios.get('/api/categories?countOnly=true');
      return response?.data?.count ?? 0;
    } catch (error) {
      console.error('Failed to fetch categories count', error);
      return 0;
    }
  }});

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: false },
    { name: 'AI Generation', href: '/admin/ai-generation', icon: CpuChipIcon, current: false },
    { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon, current: false, badge: reportsCount !== undefined ? reportsCount.toLocaleString() : undefined },
    { name: 'Press Releases', href: '/admin/press-releases', icon: NewspaperIcon, current: false, badge: pressReleasesCount !== undefined && pressReleasesCount > 0 ? pressReleasesCount.toLocaleString() : undefined },
    { name: 'Testimonials', href: '/admin/testimonials', icon: ChatBubbleLeftRightIcon, current: false },
    { name: 'Categories', href: '/admin/categories', icon: FolderIcon, current: false, badge: categoriesCount !== undefined ? categoriesCount.toLocaleString() : undefined },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon, current: false, badge: ordersCount !== undefined ? ordersCount.toLocaleString() : undefined },
    { name: 'Requests', href: '/admin/requests', icon: ChatBubbleLeftRightIcon, current: false, badge: requestsCount !== undefined ? requestsCount.toLocaleString() : undefined },
    { name: 'Customization', href: '/admin/customization', icon: PencilSquareIcon, current: false },
    { name: 'Translations', href: '/admin/translations', icon: GlobeAltIcon, current: false },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, current: false },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon, current: false }
  ]

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
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200 bg-white">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-8 w-auto">
              <Image
                src="/logo.png"
                alt="TBI Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-full w-auto object-contain"
                style={{ width: 'auto', height: '100%' }}
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 leading-none">Admin</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">The Brainy Insights</p>
            </div>
          </Link>
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
