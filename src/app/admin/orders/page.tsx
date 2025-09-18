import AdminLayout from '@/components/layout/AdminLayout'
import OrderList from '@/components/orders/OrderList'

export default function AdminOrdersPage({ searchParams }) {
  return (
    <AdminLayout>
      <OrderList searchParams={searchParams} />
    </AdminLayout>
  )
}
