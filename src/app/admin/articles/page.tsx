"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Article } from "@/types";
import Link from "next/link";

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([]);

  // Fetch articles
  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      return;
    }
    setArticles(data);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Toggle is_featured status
  const toggleFeatured = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ is_featured: !article.is_featured })
      .eq("id", article.id);

    if (error) {
      console.error("Error updating article:", error);
      return;
    }

    fetchArticles();
  };

  return (
    <div>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Article Management</h1>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="text-sm text-gray-500 mb-4">Slug: {article.slug}</p>
              <p className="text-sm text-gray-500 mb-4">
                Featured: {article.is_featured ? "Yes" : "No"}
              </p>

              {/* Toggle Featured */}
              <button
                onClick={() => toggleFeatured(article)}
                className={`px-4 py-2 rounded ${
                  article.is_featured
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {article.is_featured ? "Unfeature" : "Feature"} Article
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
