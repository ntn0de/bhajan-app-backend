import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedArticles({
  articles,
}: {
  articles: Article[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles &&
        articles.map((article: Article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
            </div>
          </Link>
        ))}
    </div>
  );
}
