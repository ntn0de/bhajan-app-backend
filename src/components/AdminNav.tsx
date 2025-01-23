"use client";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const [user, setUser] = useState<any>(null);
  // on mount init supabase
  const supabase = createClient();
  const router = useRouter();
  async function signOut() {
    console.log("signing out");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      setUser(null);
      router.push("/");
    }
  }
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log(error);
      } else {
        setUser(data);
      }
    }
    getUser();
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Home
        </Link>
        <div className="space-x-6">
          {/* check if logged in */}
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
              <Link href="/admin/articles/new" className="hover:text-gray-300">
                New Article
              </Link>
              <button onClick={() => signOut()} className="hover:text-gray-300">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
