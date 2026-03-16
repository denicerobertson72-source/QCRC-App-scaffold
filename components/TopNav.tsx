import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

export function TopNav() {
  return (
    <header className="topnav">
      <nav>
        <div className="topnav-home">
          <img src="/qcrc-lockup.svg" alt="QCRC" className="topnav-logo topnav-logo-plain" />
          <Link href="/reservations">Reservations</Link>
        </div>
        <Link href="/reserve">Reserve</Link>
        <Link href="/programs">Programs</Link>
        <Link href="/lineups">Lineups</Link>
        <Link href="/boats">Boats</Link>
        <Link href="/damage/new">Damage</Link>
        <Link href="/admin">Admin</Link>
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
