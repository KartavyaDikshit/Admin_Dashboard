import AdminLayout from '@/components/layout/AdminLayout'
import CategoryList from '@/components/categories/CategoryList'

export default function AdminCategoriesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <AdminLayout>
      <CategoryList searchParams={searchParams} />
    </AdminLayout>
  )
}
