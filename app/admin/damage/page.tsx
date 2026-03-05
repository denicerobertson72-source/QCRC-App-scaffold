import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { StatusChip } from "@/components/ui/StatusChip";

export default async function AdminDamagePage() {
  const { supabase } = await ensureProfile();

  const { data } = await supabase
    .from("damage_reports")
    .select("id, boat_id, severity, status, reported_at, description")
    .order("reported_at", { ascending: false });

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Admin: Damage Queue" subtitle="Incoming incidents requiring triage and resolution." />

        <div className="stack">
          {(data ?? []).map((item) => (
            <Card key={item.id} className="stack">
              <div className="page-title">
                <h3>{item.boat_id}</h3>
                <StatusChip label={item.status} />
              </div>
              <p>
                <strong>Severity {item.severity}</strong>
              </p>
              <p>{item.description}</p>
              <p className="muted">{new Date(item.reported_at).toLocaleString()}</p>
            </Card>
          ))}
          {(data ?? []).length === 0 ? <Card subtle>No damage reports yet.</Card> : null}
        </div>
      </main>
    </>
  );
}
