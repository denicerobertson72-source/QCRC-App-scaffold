import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/auth";

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
        <h1>Admin: Damage Queue</h1>
        <div className="stack">
          {(data ?? []).map((item) => (
            <article key={item.id} className="card">
              <h3>{item.boat_id}</h3>
              <p>
                Severity {item.severity} | {item.status}
              </p>
              <p>{item.description}</p>
              <p>{new Date(item.reported_at).toLocaleString()}</p>
            </article>
          ))}
          {(data ?? []).length === 0 ? <p>No damage reports yet.</p> : null}
        </div>
      </main>
    </>
  );
}
