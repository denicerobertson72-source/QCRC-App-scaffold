import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/auth";

export default async function AdminAnalyticsPage() {
  const { supabase } = await ensureProfile();

  const [{ data: usage }, { data: damage }, { count: overdue }] = await Promise.all([
    supabase.from("v_boat_usage_hours").select("boat_name, usage_month, reserved_hours, on_water_hours").limit(50),
    supabase.from("v_damage_by_boat").select("boat_name, damage_reports, avg_severity, last_reported_at").limit(50),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "checked_out")
      .lt("end_time", new Date().toISOString()),
  ]);

  return (
    <>
      <TopNav />
      <main className="stack">
        <h1>Admin: Analytics</h1>

        <article className="card">
          <h2>Overdue Returns</h2>
          <p>{overdue ?? 0} checked-out boats are past expected return.</p>
        </article>

        <article className="card">
          <h2>Boat Usage (Recent)</h2>
          <table>
            <thead>
              <tr>
                <th>Boat</th>
                <th>Month</th>
                <th>Reserved Hrs</th>
                <th>On-Water Hrs</th>
              </tr>
            </thead>
            <tbody>
              {(usage ?? []).map((row: any, idx: number) => (
                <tr key={`${row.boat_name}-${idx}`}>
                  <td>{row.boat_name}</td>
                  <td>{new Date(row.usage_month).toLocaleDateString()}</td>
                  <td>{Number(row.reserved_hours ?? 0).toFixed(1)}</td>
                  <td>{Number(row.on_water_hours ?? 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Damage by Boat</h2>
          <table>
            <thead>
              <tr>
                <th>Boat</th>
                <th>Reports</th>
                <th>Avg Severity</th>
                <th>Last Report</th>
              </tr>
            </thead>
            <tbody>
              {(damage ?? []).map((row: any, idx: number) => (
                <tr key={`${row.boat_name}-${idx}`}>
                  <td>{row.boat_name}</td>
                  <td>{row.damage_reports}</td>
                  <td>{row.avg_severity ?? "-"}</td>
                  <td>{row.last_reported_at ? new Date(row.last_reported_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </main>
    </>
  );
}
