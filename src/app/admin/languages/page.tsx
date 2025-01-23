"use client";

import { useState, useEffect } from "react";
import { Language } from "@/types";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/utils/error";

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newLanguage, setNewLanguage] = useState({
    code: "",
    name: "",
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      handleError("Error fetching languages", error);
      return;
    }

    setLanguages(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("languages")
      .insert([
        {
          code: newLanguage.code,
          name: newLanguage.name,
          is_default: newLanguage.is_default,
          is_active: newLanguage.is_active,
        },
      ])
      .select();

    if (error) {
      handleError("Error adding language", error);
      return;
    }

    setNewLanguage({
      code: "",
      name: "",
      is_default: false,
      is_active: true,
    });
    fetchLanguages();
  };

  const toggleLanguageStatus = async (language: Language) => {
    const { error } = await supabase
      .from("languages")
      .update({ is_active: !language.is_active })
      .eq("id", language.id);

    if (error) {
      handleError("Error updating language", error);
      return;
    }

    fetchLanguages();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Language Management</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language Code
          </label>
          <input
            type="text"
            value={newLanguage.code}
            onChange={(e) =>
              setNewLanguage({ ...newLanguage, code: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="en"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language Name
          </label>
          <input
            type="text"
            value={newLanguage.name}
            onChange={(e) =>
              setNewLanguage({ ...newLanguage, name: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="English"
            required
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={newLanguage.is_default}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, is_default: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_default"
              className="ml-2 block text-sm text-gray-900"
            >
              Default Language
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={newLanguage.is_active}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, is_active: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-900"
            >
              Active
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Language
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Supported Languages</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((language) => (
            <div key={language.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{language.name}</h3>
                  <p className="text-sm text-gray-500">Code: {language.code}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {language.is_default && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => toggleLanguageStatus(language)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      language.is_active
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {language.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
