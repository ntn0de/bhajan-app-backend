import Link from "next/link";

export default function AdminNav() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Home
        </Link>

        <div className="space-x-6">
          <Link href="/admin/categories" className="hover:text-gray-300">
            Manage Categories
          </Link>
          <Link href="/admin/articles" className="hover:text-gray-300">
            Manage Articles
          </Link>
          <Link href="/admin/articles/new" className="hover:text-gray-300">
            New Article
          </Link>
        </div>
      </div>
    </nav>
  );
}
