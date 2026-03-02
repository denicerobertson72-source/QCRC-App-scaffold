import Link from "next/link";
import { signOutAction } from "@/lib/actions";

export function TopNav() {
  return (
    <header className="topnav">
      <nav>
        <Link href="/reservations">Reservations</Link>
        <Link href="/reserve">Reserve</Link>
        <Link href="/boats">Boats</Link>
        <Link href="/damage/new">Damage</Link>
        <Link href="/admin/members">Admin</Link>
      </nav>
      <form action={signOutAction}>
        <button type="submit">Sign Out</button>
      </form>
    </header>
  );
}
