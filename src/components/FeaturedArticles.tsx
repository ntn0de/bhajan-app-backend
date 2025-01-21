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
            <div className="aspect-video relative">
              <Image
                src={article.featured_image || "/placeholder.jpg"}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 line-clamp-2">
                {article.description.substring(0, 150)}...
              </p>
            </div>
          </Link>
        ))}
    </div>
  );
}
