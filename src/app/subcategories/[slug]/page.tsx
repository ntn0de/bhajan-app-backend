import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Article, Subcategory } from "@/types";

async function getSubCategoryWithContent(slug: string) {
  const { data: category, error } = await supabase
    .from("subcategories")
    .select(
      `
      *,
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
  const subcategory = await getSubCategoryWithContent(slug);

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">{subcategory.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategory.articles.map((article: Article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.description.substring(0, 150)}...
              </p>
              <span className="text-blue-600">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
