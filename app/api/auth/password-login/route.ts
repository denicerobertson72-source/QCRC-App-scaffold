import { NextResponse } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  try {
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
      return redirectTo(request, "/login?error=Email%20and%20password%20are%20required.");
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return redirectTo(request, "/login?error=Supabase%20env%20vars%20are%20missing.");
    }

    const cookieStore = await cookies();
    const successRedirect = redirectTo(request, "/reservations");

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
      return redirectTo(request, `/login?error=${encodeURIComponent(error.message)}`);
    }

    return successRedirect;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password sign-in failed.";
    return redirectTo(request, `/login?error=${encodeURIComponent(message)}`);
  }
}
