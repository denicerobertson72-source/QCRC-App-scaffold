import { TopNav } from "@/components/TopNav";
import { ReservationForm } from "@/components/ReservationForm";
import { getAvailableBoats } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

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

  const availableBoats = await getAvailableBoats(start, end, boatClassId || undefined);

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Reserve a Boat" />

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
          {availableBoats.length === 0 ? <Card subtle>No eligible boats for the selected window.</Card> : null}
          {availableBoats.map((boat) => (
            <ReservationForm key={boat.id} boat={boat} start={start} end={end} />
          ))}
        </div>
      </main>
    </>
  );
}
