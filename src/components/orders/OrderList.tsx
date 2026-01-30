'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  currency: string
  status: string
  paymentStatus: string
  createdAt: string
  items: Array<{ report: { title: string } }>
}

interface OrderListProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    status?: string
    paymentStatus?: string
  }
}

export default function OrderList({ searchParams }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']
      const validPaymentStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']
      const filteredSearchParams = new URLSearchParams()

      for (const [key, value] of Object.entries(searchParams)) {
        if (key === 'status' && typeof value === 'string' && !validStatuses.includes(value)) {
          continue
        }
        if (key === 'paymentStatus' && typeof value === 'string' && !validPaymentStatuses.includes(value)) {
          continue
        }
        if (value !== undefined && value !== null) {
          filteredSearchParams.append(key, String(value))
        }
      }

      const response = await fetch(`/api/orders?${filteredSearchParams.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to load orders')
      }
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(orders.map(o => o.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} orders?`)) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      if (response.ok) {
        toast.success('Orders deleted successfully')
        setSelectedIds(new Set())
        fetchOrders()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete orders')
      }
    } catch {
      toast.error('Failed to delete orders')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage customer orders ({pagination.total} total)
          </p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {orders.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={orders.length > 0 && selectedIds.size === orders.length}
                    onChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-500">Select All</span>
            </div>
        )}
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-4 py-4 hover:bg-gray-50 flex items-center">
                <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                    checked={selectedIds.has(order.id)}
                    onChange={() => handleSelectOne(order.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        Order #{order.orderNumber}
                      </Link>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Customer: {order.customerName} ({order.customerEmail})</span>
                          <span>Items: {order.items.length}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          order.status === 'COMPLETED' && 'bg-green-100 text-green-800',
                          order.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                          order.status === 'CANCELLED' && 'bg-red-100 text-red-800'
                        )}>
                          {order.status}
                        </span>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          order.paymentStatus === 'COMPLETED' && 'bg-green-100 text-green-800',
                          order.paymentStatus === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                          order.paymentStatus === 'FAILED' && 'bg-red-100 text-red-800'
                        )}>
                          {order.paymentStatus}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total, order.currency)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created {formatDateTime(new Date(order.createdAt))}
                      </div>
                    </div>
                  </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Pagination controls */}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
