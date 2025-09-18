// A placeholder for the category type
type Category = {
  id: string;
  name: string;
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <div id="categories" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <div key={category.id} className="group relative text-center">
              <div className="w-full h-24 bg-indigo-100 rounded-lg overflow-hidden">
                {/* Placeholder for an image or icon */}
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                <a href="#">
                  <span className="absolute inset-0" />
                  {category.name}
                </a>
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
