import { Suspense } from "react";
import CallbackClient from "@/app/auth/callback/CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="stack" style={{ paddingTop: "3rem", maxWidth: 500 }}>
          <section className="card form-grid">
            <h1>Completing Sign-In</h1>
            <p>Finishing your secure login and redirecting...</p>
          </section>
        </main>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
