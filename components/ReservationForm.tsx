import { reserveBoatAction } from "@/lib/actions";
import type { Boat } from "@/lib/types";
import { StatusChip } from "@/components/ui/StatusChip";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ReservationForm({ boat, start, end }: { boat: Boat; start: string; end: string }) {
  return (
    <form action={reserveBoatAction} className="card form-grid">
      <div className="page-title">
        <h3>{boat.name}</h3>
        <StatusChip label={boat.boat_class_id} />
      </div>
      <p className="muted">
        {boat.boat_type} | clearance {boat.required_clearance}
      </p>

      <input type="hidden" name="boat_id" value={boat.id} />
      <Field label="Start">
        <input name="start_time" type="datetime-local" defaultValue={start} required />
      </Field>
      <Field label="End">
        <input name="end_time" type="datetime-local" defaultValue={end} required />
      </Field>
      <Field label="Crew IDs (comma-separated UUIDs)">
        <input name="crew" placeholder="uuid1,uuid2" />
      </Field>
      <Field label="Location">
        <input name="checkout_location" placeholder="Main Dock" />
      </Field>
      <Field label="Notes">
        <input name="notes" />
      </Field>
      <Button type="submit">Book</Button>
    </form>
  );
}
