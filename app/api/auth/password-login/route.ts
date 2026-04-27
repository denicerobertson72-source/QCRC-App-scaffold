import { NextResponse } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; password?: string };
    email = body.email?.trim() ?? "";
    password = body.password ?? "";
  } else {
    const formData = await request.formData();
    email = String(formData.get("email") ?? "").trim();
    password = String(formData.get("password") ?? "");
  }

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=Email%20and%20password%20are%20required.", request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=Supabase%20env%20vars%20are%20missing.", request.url));
  }

  const cookieStore = await cookies();
  const successRedirect = NextResponse.redirect(new URL("/reservations", request.url));

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        successRedirect.cookies.set(name, value, options);
      });
    },
  };

  const supabase = createServerClient(url, anonKey, {
    cookies: cookieMethods,
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return successRedirect;
}
