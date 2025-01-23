import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Category, Subcategory, Language, ArticleTranslation } from "@/types";
import { slugify } from "transliteration";

const Editor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false,
  loading: () => <div>Loading Editor...</div>,
});

interface ArticleFormProps {
  title: string;
  initialData?: {
    title: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    audioUrl: string;
    youtubeUrl: string;
    externalVideoUrl: string;
    translations?: ArticleTranslation[];
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function ArticleForm({
  title,
  initialData = {
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    audioUrl: "",
    youtubeUrl: "",
    externalVideoUrl: "",
  },
  onSubmit,
  isSubmitting,
}: ArticleFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, { title: string; description: string }>>({});
  const [formData, setFormData] = useState({
    ...initialData,
    title: initialData.title || "",
    description: initialData.description || "",
    categoryId: initialData.categoryId || "",
    subcategoryId: initialData.subcategoryId || "",
    audioUrl: initialData.audioUrl || "",
    youtubeUrl: initialData.youtubeUrl || "",
    externalVideoUrl: initialData.externalVideoUrl || "",
  });

  // Fetch languages
  useEffect(() => {
    async function fetchLanguages() {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching languages:", error);
        return;
      }

      setLanguages(data || []);

      // Initialize translations from initialData if available
      if (initialData?.translations) {
        const translationsMap: Record<string, { title: string; description: string }> = {};
        initialData.translations.forEach((translation) => {
          translationsMap[translation.language_id] = {
            title: translation.title,
            description: translation.description,
          };
        });
        setTranslations(translationsMap);
      }
    }

    fetchLanguages();
  }, [initialData]);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data || []);

      // Preselect category and subcategory if editing
      if (initialData.categoryId) {
        setFormData((prev) => ({
          ...prev,
          categoryId: initialData.categoryId || "",
          subcategoryId: initialData.subcategoryId || "",
        }));
      }
    }

    fetchCategories();
  }, [initialData]);

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
      [field]: value || "", // Ensure no `null` values
    }));

    // Reset subcategory when category changes
    if (field === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        subcategoryId: "",
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logging
    console.log('Form Data:', {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId
    });

    // Validate required fields with detailed checks
    const missingFields = [];
    if (!formData.title.trim()) missingFields.push('Title');
    if (!formData.description.trim()) missingFields.push('Content');
    if (!formData.categoryId) missingFields.push('Category');

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    onSubmit({
      ...formData,
      slug: slugify(formData.title),
      translations: Object.entries(translations).map(([languageId, content]) => ({
        language_id: languageId,
        title: content.title,
        description: content.description,
      })),
    });
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Title {!selectedLanguage && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={selectedLanguage ? translations[selectedLanguage]?.title || "" : formData.title}
          onChange={(e) => {
            if (selectedLanguage) {
              setTranslations(prev => ({
                ...prev,
                [selectedLanguage]: {
                  title: e.target.value,
                  description: translations[selectedLanguage]?.description || "",
                },
              }));
            } else {
              handleChange("title", e.target.value);
            }
          }}
          className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
          required={!selectedLanguage}
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
          className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
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

      {/* Subcategory Selection */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Subcategory</label>
          <select
            value={formData.subcategoryId}
            onChange={(e) => handleChange("subcategoryId", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
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

      {/* Language Selection - Only show when editing */}
      {initialData.id && (
        <div>
          <label className="block text-sm font-medium mb-2">Translations</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black mb-4"
          >
            <option value="">Select a language for translation</option>
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description Editor */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Content {!selectedLanguage && <span className="text-red-500">*</span>}
        </label>
        <Editor
          value={selectedLanguage ? translations[selectedLanguage]?.description || "" : formData.description}
          onChange={(content) => {
            if (selectedLanguage) {
              setTranslations(prev => ({
                ...prev,
                [selectedLanguage]: {
                  title: translations[selectedLanguage]?.title || "",
                  description: content,
                },
              }));
            } else {
              handleChange("description", content);
            }
          }}
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
            className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">YouTube URL</label>
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => handleChange("youtubeUrl", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:border-gray-700 dark:text-black"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
