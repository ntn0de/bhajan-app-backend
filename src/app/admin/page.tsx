import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { handleError } from '@/utils/error';

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    handleError('Error fetching session', error);
    redirect('/error');
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      {/* Add admin components here */}
    </div>
  );
}