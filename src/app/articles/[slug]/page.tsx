import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

async function getArticle(slug: string) {
  const { data: article, error } = await supabase
    .from("articles")
    .select(
      `
      *
    `
    )
    .eq("slug", slug)
    .single();

  console.log({ article, error });

  if (error || !article) {
    return null;
  }

  return article;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // console.log({params})
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-gray-600 space-x-4">
            <span>By {article.author?.full_name}</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        <div
          className="prose max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: article.description }}
        />

        {/* Media Section */}
        {(article.youtube_url ||
          article.audio_url ||
          article.external_video_url) && (
          <div className="space-y-4 mt-8">
            {article.youtube_url && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${
                    article.youtube_url.split("v=")[1]
                  }`}
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
