"use client";

import { useState, useEffect } from "react";
import { Category, Language, Subcategory } from "@/types";
import { supabase } from "@/lib/supabase";

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Category | Subcategory;
  type: "category" | "subcategory";
  isLoading?: boolean;
}

export function TranslationModal({
  isOpen,
  onClose,
  item,
  type,
  isLoading = false,
}: TranslationModalProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, { name: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

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
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    async function fetchTranslations() {
      const { data, error } = await supabase
        .from("category_translations")
        .select("*")
        .eq(type === "category" ? "category_id" : "subcategory_id", item.id);

      if (error) {
        console.error("Error fetching translations:", error);
        return;
      }

      const translationsMap: Record<string, { name: string }> = {};
      data?.forEach((translation) => {
        translationsMap[translation.language_id] = {
          name: translation.name,
        };
      });
      setTranslations(translationsMap);
    }

    if (isOpen && item) {
      fetchTranslations();
    }
  }, [isOpen, item, type]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Delete existing translations
      await supabase
        .from("category_translations")
        .delete()
        .eq(type === "category" ? "category_id" : "subcategory_id", item.id);

      // Insert new translations
      if (Object.keys(translations).length > 0) {
        const translationData = Object.entries(translations).map(([languageId, content]) => ({
          [type === "category" ? "category_id" : "subcategory_id"]: item.id,
          language_id: languageId,
          name: content.name,
        }));

        const { error: translationError } = await supabase
          .from("category_translations")
          .insert(translationData);

        if (translationError) throw translationError;
      }

      onClose();
    } catch (error) {
      console.error("Error saving translations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">
          Manage Translations for {item.name}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black mb-4"
              disabled={isLoading || isSaving}
            >
              <option value="">Select a language for translation</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>

            {selectedLanguage && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Translated Name
                </label>
                <input
                  type="text"
                  value={translations[selectedLanguage]?.name || ""}
                  onChange={(e) =>
                    setTranslations((prev) => ({
                      ...prev,
                      [selectedLanguage]: {
                        name: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black"
                  disabled={isLoading || isSaving}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading || isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Translations"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}