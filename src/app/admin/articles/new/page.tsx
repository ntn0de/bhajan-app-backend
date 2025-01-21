// src/app/admin/articles/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Category, Subcategory } from "@/types";
import { slugify } from "transliteration";

const Editor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false, // Ensure it's client-side only
  loading: () => <div>Loading Editor...</div>, // Provide a fallback
});

export default function NewArticle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "", // Will store the UUID
    subcategoryId: "", // Will store the UUID
    audioUrl: "",
    youtubeUrl: "",
    externalVideoUrl: "",
  });

  // Fetch categories when component mounts
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data || []);
    }

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    async function fetchSubcategories() {
      if (!formData.categoryId) {
        setSubcategories([]);
        return;
      }

      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", formData.categoryId);

      if (error) {
        console.error("Error fetching subcategories:", error);
        return;
      }

      setSubcategories(data || []);
    }

    fetchSubcategories();
  }, [formData.categoryId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset subcategory when category changes
    if (field === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.categoryId) {
        throw new Error("Please fill in all required fields");
      }

      // Create slug from title
      const slug = slugify(formData.title);

      // Prepare the article data
      const articleData = {
        title: formData.title,
        slug,
        description: formData.description,
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId || null, // Convert empty string to null
        audio_url: formData.audioUrl || null,
        youtube_url: formData.youtubeUrl || null,
        external_video_url: formData.externalVideoUrl || null,
      };

      // Insert the article into Supabase
      const { error } = await supabase
        .from("articles")
        .insert([articleData])
        .select()
        .single();

      if (error) throw error;

      router.push("/admin/articles");
    } catch (error) {
      console.error("Error creating article:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create article. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Create New Article</h1>

      {/* Title input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => handleChange("categoryId", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Selection (only shown if category has subcategories) */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategory</label>
          <select
            value={formData.subcategoryId}
            onChange={(e) => handleChange("subcategoryId", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description editor */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <Editor
          value={formData.description}
          onChange={(content) => handleChange("description", content)}
          className="min-h-[400px]"
        />
      </div>

      {/* Optional URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Audio URL</label>
          <input
            type="url"
            value={formData.audioUrl}
            onChange={(e) => handleChange("audioUrl", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">YouTube URL</label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => handleChange("youtubeUrl", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Article"}
      </button>
    </form>
  );
}
