import AdminLayout from '@/components/layout/AdminLayout'
import CategoryList from '@/components/categories/CategoryList'

export default function AdminCategoriesPage({ searchParams }) {
  return (
    <AdminLayout>
      <CategoryList searchParams={searchParams} />
    </AdminLayout>
  )
}
