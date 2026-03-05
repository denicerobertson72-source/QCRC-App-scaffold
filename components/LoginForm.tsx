"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/reservations`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setMessage("Magic link sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected login error");
    }
  }

  async function signInWithPassword() {
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      window.location.href = "/reservations";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected password login error");
    }
  }

  async function createPasswordAccount() {
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/reservations`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage("Account created. Check your email once to confirm, then you can use password login.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected sign-up error");
    }
  }

  return (
    <form onSubmit={sendMagicLink} className="card form-grid">
      <h1>QCRC Login</h1>
      <p className="muted">Use your club email to get a one-time sign-in link.</p>
      <Field label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@club.org"
        />
      </Field>
      <Field label="Password (optional)">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Use password login after setup"
        />
      </Field>
      <Button type="submit">Send Magic Link</Button>
      <div className="row">
        <Button type="button" variant="secondary" onClick={signInWithPassword} disabled={!email || !password}>
          Sign In with Password
        </Button>
        <Button type="button" variant="secondary" onClick={createPasswordAccount} disabled={!email || !password}>
          Create Password Login
        </Button>
      </div>
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
