import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/auth";

export default async function AdminClearancesPage() {
  const { supabase } = await ensureProfile();

  const { data } = await supabase
    .from("member_clearances")
    .select("id, clearance_level, approved_at, profiles!member_clearances_member_id_fkey(full_name), boat_classes(name, id)")
    .order("approved_at", { ascending: false });

  return (
    <>
      <TopNav />
      <main className="stack">
        <h1>Admin: Clearances</h1>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Boat Class</th>
                <th>Level</th>
                <th>Approved At</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row: any) => (
                <tr key={row.id}>
                  <td>{row.profiles?.full_name}</td>
                  <td>{row.boat_classes?.id}</td>
                  <td>{row.clearance_level}</td>
                  <td>{new Date(row.approved_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
