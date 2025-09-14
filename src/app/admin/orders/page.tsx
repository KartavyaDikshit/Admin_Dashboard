import AdminLayout from '@/components/layout/AdminLayout'
import OrderList from '@/components/orders/OrderList'

export default function AdminOrdersPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <AdminLayout>
      <OrderList searchParams={searchParams} />
    </AdminLayout>
  )
}
