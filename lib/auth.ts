import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getUserFromSupabaseToken(token: string) {
  const supabase = createMiddlewareSupabaseClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}
