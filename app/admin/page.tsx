import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { ensureProfile } from "@/lib/auth";

export default async function AdminPage() {
  await ensureProfile();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Admin" subtitle="Manage members, boats, clearances, and damage workflow." />

        <div className="grid">
          <Card className="stack">
            <h3>Members</h3>
            <p className="muted">Update roles, dues, skill level, and weight class.</p>
            <Link href="/admin/members">Open Members</Link>
          </Card>

          <Card className="stack">
            <h3>Boats</h3>
            <p className="muted">Add boats and set out-of-service availability.</p>
            <Link href="/admin/boats">Open Boats</Link>
          </Card>

          <Card className="stack">
            <h3>Availability</h3>
            <p className="muted">Block all boats (or a class/group) during practice windows.</p>
            <Link href="/admin/availability">Open Availability</Link>
          </Card>

          <Card className="stack">
            <h3>Lineups</h3>
            <p className="muted">Build drag-and-drop lineups and publish for members.</p>
            <Link href="/admin/lineups">Open Lineups</Link>
          </Card>

          <Card className="stack">
            <h3>Races</h3>
            <p className="muted">Create race events and review race signup preferences.</p>
            <Link href="/admin/races">Open Races</Link>
          </Card>

          <Card className="stack">
            <h3>Program Schedule</h3>
            <p className="muted">Generate monthly dates and cancel sessions shown to rowers.</p>
            <Link href="/admin/programs">Open Program Schedule</Link>
          </Card>
        </div>

        <div className="row">
          <Link href="/admin/clearances">Clearances</Link>
          <Link href="/admin/damage">Damage Queue</Link>
          <Link href="/admin/analytics">Analytics</Link>
        </div>
      </main>
    </>
  );
}
