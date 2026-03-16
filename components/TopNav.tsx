import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ensureProfile } from "@/lib/auth";

export async function TopNav() {
  const { supabase, user } = await ensureProfile();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = data?.role === "admin";

  return (
    <header className="topnav">
      <nav>
        <div className="topnav-home">
          <img src="/QCRC.png" alt="QCRC" className="topnav-logo topnav-logo-plain" />
          <Link href="/reservations">Reservations</Link>
        </div>
        <Link href="/reserve">Reserve</Link>
        <Link href="/safety">Safety</Link>
        <Link href="/programs">Programs</Link>
        <Link href="/lineups">Lineups</Link>
        <Link href="/boats">Boats</Link>
        <Link href="/damage/new">Damage</Link>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
        <Link href="/account/security">Security</Link>
      </nav>
      <form action={signOutAction}>
        <Button type="submit" variant="secondary">
          Sign Out
        </Button>
      </form>
    </header>
  );
}
