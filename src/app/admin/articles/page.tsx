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

  async function deleteArticle(article: Article) {
    try {
      await supabase.from("articles").delete().eq("id", article.id);
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      return;
    }
  }

  return (
    <div>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Article Management</h1>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white p-6 rounded-lg shadow relative"
            >
              <h3 className="text-lg font-semibold mb-2">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="text-sm text-gray-500 mb-4">Slug: {article.slug}</p>
              <p className="text-sm text-gray-500 mb-4">
                Featured: {article.is_featured ? "Yes" : "No"}
              </p>
              <label className="inline-flex items-center cursor-pointer absolute right-4 top-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={article.is_featured}
                  onChange={() => toggleFeatured(article)}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Featured
                </span>
              </label>

              {/* Delete Article */}
              <button
                onClick={() => deleteArticle(article)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete Article
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
