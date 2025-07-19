// lib/getUserFromRequest.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getUserFromRequest() {
  const supabase = createServerClient(cookies());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
