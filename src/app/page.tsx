import { supabase } from "@/lib/supabase";
import FeaturedArticles from "@/components/FeaturedArticles";
import { Article, Category } from "@/types";
import FeaturedCategories from "@/components/FeaturedCategories";

export default async function Home() {
  const { data: featuredArticles } = await supabase
    .from("articles")
    .select("*, categories(*)")
    // .eq("is_featured", true)
    .limit(6);
  const articles: Article[] = featuredArticles ?? [];
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*, subcategories(*)");
  const categories: Category[] = categoriesData ?? [];

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Featured Articles</h2>
        <FeaturedArticles articles={articles} />
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Featured Categories</h2>
        <FeaturedCategories categories={categories} />
      </section>
    </main>
  );
}
