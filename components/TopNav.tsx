import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";

export function TopNav() {
  return (
    <header className="topnav">
      <nav>
        <span className="topnav-brand">QCRC</span>
        <Link href="/reservations">Reservations</Link>
        <Link href="/reserve">Reserve</Link>
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
