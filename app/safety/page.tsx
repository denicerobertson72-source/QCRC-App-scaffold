import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { getSafetyDashboard } from "@/lib/queries";
import { formatEasternDateTime } from "@/lib/time";
import { StatusChip } from "@/components/ui/StatusChip";

export default async function SafetyPage() {
  const { onWater, recentLog } = await getSafetyDashboard();
  const overdue = onWater.filter((entry) => entry.is_overdue);

  return (
    <>
      <TopNav />
      <main className="stack">
        <section className="hero-panel stack">
          <span className="eyebrow">Safety</span>
          <PageTitle
            title="On-Water Safety"
            subtitle={`Currently on the water: ${onWater.length}. Overdue boats: ${overdue.length}. A boat becomes overdue two hours after launch.`}
          />
        </section>

        <div className="grid">
          <Card className="stack">
            <h3>Currently On The Water</h3>
            {onWater.length === 0 ? <p className="muted">No active launches right now.</p> : null}
            {onWater.map((entry) => (
              <Card key={entry.id} subtle>
                <div className="page-title">
                  <h4>{entry.boat_name}</h4>
                  <StatusChip label={entry.is_overdue ? "overdue" : "on water"} kind={entry.is_overdue ? "reserved" : "checked_out"} />
                </div>
                <p className="muted">{entry.rower_name}</p>
                <p>
                  Launched: {formatEasternDateTime(entry.checked_out_at ?? entry.start_time)} ET
                </p>
                <p>
                  {entry.checkout_location ?? "Location not set"} | {entry.river_direction ?? "Direction not set"}
                </p>
              </Card>
            ))}
          </Card>

          <Card className="stack">
            <h3>Overdue Boats</h3>
            {overdue.length === 0 ? <p className="muted">No overdue boats.</p> : null}
            {overdue.map((entry) => (
              <Card key={entry.id} subtle>
                <h4>{entry.boat_name}</h4>
                <p className="muted">{entry.rower_name}</p>
                <p>Launched: {formatEasternDateTime(entry.checked_out_at ?? entry.start_time)} ET</p>
              </Card>
            ))}
          </Card>
        </div>

        <Card className="stack">
          <h3>Recent Launch / Return Log</h3>
          {recentLog.length === 0 ? <p className="muted">No launch or return activity yet.</p> : null}
          <table>
            <thead>
              <tr>
                <th>Boat</th>
                <th>Rower</th>
                <th>Status</th>
                <th>Launch</th>
                <th>Return</th>
                <th>Route</th>
              </tr>
            </thead>
            <tbody>
              {recentLog.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.boat_name}</td>
                  <td>{entry.rower_name}</td>
                  <td>{entry.status === "checked_out" ? "On Water" : "Returned"}</td>
                  <td>{entry.checked_out_at ? `${formatEasternDateTime(entry.checked_out_at)} ET` : "-"}</td>
                  <td>{entry.checked_in_at ? `${formatEasternDateTime(entry.checked_in_at)} ET` : "-"}</td>
                  <td>
                    {entry.checkout_location ?? "-"}{entry.river_direction ? ` / ${entry.river_direction}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
