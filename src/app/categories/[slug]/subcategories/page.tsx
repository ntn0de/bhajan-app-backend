import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getSubCategories(slug: string) {
  const { data: category, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      subcategories(*),
      articles(*)
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !category) {
    return null;
  }

  return category;
}

export default async function SubCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getSubCategories(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">{category.name}</h1>
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Subcategories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${category.slug}/subcategories/${sub.slug}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{sub.name}</h3>
              <span className="text-blue-600">View articles →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
