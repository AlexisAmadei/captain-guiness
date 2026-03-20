"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getEmailRedirectTo(headerStore: Headers) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (envSiteUrl) {
    return `${envSiteUrl}/auth/callback`;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000/auth/callback";
  }

  return `${protocol}://${host}/auth/callback`;
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const headerStore = await headers();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectTo(headerStore),
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/auth/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/login?registered=1");
}
