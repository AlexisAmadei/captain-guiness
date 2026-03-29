import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth/redirect";

function isSupportedEmailOtpType(value: string | null): value is EmailOtpType {
  if (!value) {
    return false;
  }

  return ["signup", "invite", "magiclink", "recovery", "email_change", "email"].includes(value);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  const safeNext = sanitizeNextPath(next, "/");
  const errorRedirect = new URL("/auth/error", request.url);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(errorRedirect);
    }

    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  if (tokenHash && isSupportedEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(errorRedirect);
    }

    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return NextResponse.redirect(errorRedirect);
}
