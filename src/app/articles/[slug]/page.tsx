"use client";

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";

export default function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        const { data: article, error } = await supabase
          .from("articles")
          .select(`
            *,
            translations:article_translations(language_id, title, description),
            languages:article_translations(languages(*))
          `)
          .eq("slug", params.slug)
          .single();

        if (error || !article) {
          notFound();
          return;
        }

        setArticle(article);
      } catch (error) {
        console.error("Error fetching article:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [params.slug]);

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!article) {
    return notFound();
  }

  // Find the selected translation or use the original content
  const currentContent = selectedLanguage
    ? article.translations?.find((t: any) => t.language_id === selectedLanguage)
    : article;

  // Get unique languages from translations
  const availableLanguages = article.languages?.filter((l: any) => l.languages?.is_active) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <article className="max-w-4xl mx-auto">
        {availableLanguages.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
            >
              <option value="">Original Language</option>
              {availableLanguages.map((lang: any) => (
                <option key={lang.languages.id} value={lang.languages.id}>
                  {lang.languages.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{currentContent.title}</h1>
          <div className="flex items-center text-gray-600 space-x-4">
            {article.author?.full_name && (
              <>
                <span>By {article.author.full_name}</span>
                <span>•</span>
              </>
            )}
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        <div
          className="prose max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: currentContent.description }}
        />

        {/* Media Section */}
        {(article.youtube_url ||
          article.audio_url ||
          article.external_video_url) && (
          <div className="space-y-4 mt-8">
            {article.youtube_url && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${article.youtube_url.split("v=")[1]}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {article.audio_url && (
              <audio controls className="w-full">
                <source src={article.audio_url} />
              </audio>
            )}

            {article.external_video_url && (
              <video controls className="w-full">
                <source src={article.external_video_url} />
              </video>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
