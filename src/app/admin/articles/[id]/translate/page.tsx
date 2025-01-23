"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Language, ArticleTranslation, Article } from "@/types";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false,
  loading: () => <div>Loading Editor...</div>,
});

export default function TranslateArticle() {
  const router = useRouter();
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, ArticleTranslation>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch article and its translations
  useEffect(() => {
    async function fetchArticleAndTranslations() {
      try {
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select(`
            *,
            translations:article_translations(language_id, title, description)
          `)
          .eq("id", id)
          .single();

        if (articleError) {
          setError("Error fetching article. Please try again.");
          console.error("Error fetching article:", articleError);
          return;
        }

        if (!articleData) {
          setError("Article not found.");
          return;
        }

        setArticle(articleData);
        setError(null);

        // Convert translations array to record object
        const translationsRecord: Record<string, ArticleTranslation> = {};
        articleData.translations?.forEach((translation: ArticleTranslation) => {
          translationsRecord[translation.language_id] = translation;
        });
        setTranslations(translationsRecord);
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error(err);
      }
    }

    async function fetchLanguages() {
      try {
        const { data, error } = await supabase
          .from("languages")
          .select("*")
          .eq("is_active", true);

        if (error) {
          setError("Error fetching languages. Please try again.");
          console.error("Error fetching languages:", error);
          return;
        }

        setLanguages(data || []);
      } catch (err) {
        setError("An unexpected error occurred while fetching languages.");
        console.error(err);
      }
    }

    fetchArticleAndTranslations();
    fetchLanguages();
  }, [id]);

  const handleTranslationChange = (field: string, value: string) => {
    if (!selectedLanguage) return;

    setTranslations((prev) => ({
      ...prev,
      [selectedLanguage]: {
        ...prev[selectedLanguage],
        language_id: selectedLanguage,
        article_id: id,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage) return;

    setIsSubmitting(true);
    try {
      const translation = translations[selectedLanguage];
      const { error } = await supabase
        .from("article_translations")
        .upsert([
          {
            article_id: id,
            language_id: selectedLanguage,
            title: translation.title,
            description: translation.description,
          },
        ]);

      if (error) throw error;

      alert("Translation saved successfully!");
    } catch (error) {
      console.error("Error saving translation:", error);
      alert("Failed to save translation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.push("/admin/articles")}
          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  if (!article) return <div className="container mx-auto p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Translate Article: {article.title}</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Language</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
        >
          <option value="">Choose a language</option>
          {languages.map((language) => (
            <option key={language.id} value={language.id}>
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLanguage && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={translations[selectedLanguage]?.title || ""}
              onChange={(e) => handleTranslationChange("title", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Editor
              value={translations[selectedLanguage]?.description || ""}
              onChange={(content) => handleTranslationChange("description", content)}
              className="min-h-[400px]"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Translation"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Articles
            </button>
          </div>
        </form>
      )}
    </div>
  );
}