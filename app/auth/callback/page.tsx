"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextPath = searchParams.get("next") ?? "/reservations";

    async function completeAuth() {
      try {
        const supabase = createClient();
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          // Handles flows that deliver tokens in URL fragments.
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
        }

        router.replace(nextPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete sign-in");
      }
    }

    void completeAuth();
  }, [router, searchParams]);

  return (
    <main className="stack" style={{ paddingTop: "3rem", maxWidth: 500 }}>
      <section className="card form-grid">
        <h1>Completing Sign-In</h1>
        <p>Finishing your secure login and redirecting...</p>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
