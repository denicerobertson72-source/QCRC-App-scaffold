import { TopNav } from "@/components/TopNav";
import { ReservationForm } from "@/components/ReservationForm";
import { getAvailableBoats, getBoats, getMyProfileSummary } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";

type ReserveSearchParams = Promise<{
  start?: string;
  end?: string;
  boatClassId?: string;
}>;

function toInputDateTime(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function ReservePage({
  searchParams,
}: {
  searchParams: ReserveSearchParams;
}) {
  const params = await searchParams;

  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const start = params.start ?? toInputDateTime(now);
  const end = params.end ?? toInputDateTime(inTwoHours);
  const boatClassId = params.boatClassId ?? "";

  const [availableBoats, allBoats, profile] = await Promise.all([
    getAvailableBoats(start, end, boatClassId || undefined),
    getBoats(),
    getMyProfileSummary(),
  ]);

  const availableIds = new Set(availableBoats.map((b) => b.id));
  const visibleBoats = boatClassId ? allBoats.filter((b) => b.boat_class_id === boatClassId) : allBoats;

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle
          title="Reserve a Boat"
          subtitle={`Your profile: ${profile.skill_level} | ${profile.weight_class}`}
        />

        <form method="get" className="card form-grid">
          <Field label="Start">
            <input name="start" type="datetime-local" defaultValue={start} required />
          </Field>
          <Field label="End">
            <input name="end" type="datetime-local" defaultValue={end} required />
          </Field>
          <Field label="Boat Class">
            <select name="boatClassId" defaultValue={boatClassId}>
              <option value="">All</option>
              <option value="1x">1x</option>
              <option value="2x">2x</option>
              <option value="4x">4x</option>
            </select>
          </Field>
          <Button type="submit">Find Eligible Boats</Button>
        </form>

        <div className="grid">
          {visibleBoats.length === 0 ? <Card subtle>No boats found.</Card> : null}

          {visibleBoats.map((boat) => {
            const reservable = boat.status === "available" && availableIds.has(boat.id);
            if (reservable) {
              return <ReservationForm key={boat.id} boat={boat} start={start} end={end} />;
            }

            return (
              <Card key={boat.id} className="stack">
                <div className="page-title">
                  <h3>{boat.name}</h3>
                  <StatusChip label={boat.status === "available" ? "unavailable" : "out of service"} />
                </div>
                <p className="muted">
                  {boat.boat_class_id} | {boat.boat_type} | skill {boat.required_skill_level} | weight {boat.weight_class ?? "Any"}
                </p>
                <p>
                  This boat cannot be reserved right now.
                  {boat.status !== "available" ? " Marked out of service by admin." : " It is unavailable for this time window."}
                </p>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
