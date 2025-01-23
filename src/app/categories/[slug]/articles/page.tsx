import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Article, Subcategory } from "@/types";

async function getCategoryWithContent(slug: string) {
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryWithContent(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">{category.name}</h1>

      {/* Show subcategories if they exist */}
      {category.subcategories?.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {category.subcategories.map((sub: Subcategory) => (
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
      ) : (
        // Show articles if no subcategories
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.articles.map((article: Article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <span className="text-blue-600">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
