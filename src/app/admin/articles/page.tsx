"use client";

import { useState, useEffect } from "react";
import { Article } from "@/types";
import Link from "next/link";
import { fetchArticles, deleteArticle, updateArticle } from "@/utils/articles";

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles
  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Toggle is_featured status
  const toggleFeatured = async (article: Article) => {
    const success = await updateArticle(article.id, { is_featured: !article.is_featured });
    if (success) {
      loadArticles();
    }
  };

  async function handleDeleteArticle(article: Article) {
    const success = await deleteArticle(article.id);
    if (success) {
      loadArticles();
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Article Management</h1>
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Article Management</h1>
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add New Article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No articles found. Create your first article!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow dark:bg-gray-800"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-sm text-gray-500 mb-4">Slug: {article.slug}</p>
                {article.translations && article.translations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Available translations:</p>
                    <div className="flex gap-2 mt-1">
                      {article.translations.map((translation: any) => (
                        <span
                          key={translation.language_id}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          {translation.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  href={`/admin/articles/${article.id}/translate`}
                  className="text-blue-600 hover:text-blue-800 text-sm block mb-4"
                >
                  Manage Translations
                </Link>
                <label className="inline-flex items-center cursor-pointer relative mb-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={article.is_featured}
                    onChange={() => toggleFeatured(article)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {article.is_featured ? "" : "Not"} Featured
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteArticle(article)}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Article
                  </button>
                  <Link
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    href={`/admin/articles/${article.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
