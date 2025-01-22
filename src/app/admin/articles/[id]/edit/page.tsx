"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ArticleForm from "@/components/ArticleForm";
import { supabase } from "@/lib/supabase";

export default function EditArticle() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error fetching article:", error);
        return;
      }
      setInitialData({
        ...data,
        categoryId: data.category_id,
        subcategoryId: data.subcategory_id,
        audioUrl: data.audio_url,
        youtubeUrl: data.youtube_url,
        externalVideoUrl: data.external_video_url,
      });
    }
    fetchArticle();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const articleData = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId || null,
        audio_url: data.audioUrl || null,
        youtube_url: data.youtubeUrl || null,
        external_video_url: data.externalVideoUrl || null,
      };

      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", id);
      if (error) throw error;

      router.push("/admin/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <ArticleForm
      title="Edit Article"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
