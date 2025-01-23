"use client";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      router.push("/");
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (data)
          // Only set the user if data exists
          setUser(data?.user || null);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    getUser();

    // Auth state listener to update on login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Home
        </Link>
        <div className="space-x-6">
          {!user ? (
            <Link href="/login" className="hover:text-gray-300">
              Login
            </Link>
          ) : (
            <>
              <Link href="/admin/categories" className="hover:text-gray-300">
                Manage Categories
              </Link>
              <Link href="/admin/articles" className="hover:text-gray-300">
                Manage Articles
              </Link>
              <Link href="/admin/languages" className="hover:text-gray-300">
                Manage Languages
              </Link>
              <Link href="/admin/articles/new" className="hover:text-gray-300">
                New Article
              </Link>
              <button onClick={signOut} className="hover:text-gray-300">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
