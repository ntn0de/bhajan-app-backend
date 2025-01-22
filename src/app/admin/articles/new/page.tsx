"use client";

import { useRouter } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function AddArticle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
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

      const { error } = await supabase.from("articles").insert([articleData]);
      if (error) throw error;

      router.push("/admin/articles");
    } catch (error) {
      console.error("Error adding article:", error);
      alert("Failed to add the article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm
      title="Add New Article"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialData={{
        title: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        audioUrl: "",
        youtubeUrl: "",
        externalVideoUrl: "",
      }}
    />
  );
}
