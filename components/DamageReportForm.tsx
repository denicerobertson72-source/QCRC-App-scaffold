import { submitDamageAction } from "@/lib/actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function DamageReportForm() {
  return (
    <form action={submitDamageAction} className="card form-grid">
      <h2>New Damage Report</h2>
      <p className="muted">Attach clear notes and at least one stored photo path.</p>

      <Field label="Reservation ID (optional)">
        <input name="reservation_id" />
      </Field>
      <Field label="Boat ID">
        <input name="boat_id" required />
      </Field>
      <Field label="Severity (1-5)">
        <input name="severity" type="number" min={1} max={5} defaultValue={3} required />
      </Field>
      <Field label="Responsible Member ID (optional)">
        <input name="responsible_member_id" />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={4} required />
      </Field>
      <Field label="Photo storage paths (one per line)">
        <textarea
          name="photo_paths"
          rows={4}
          placeholder={"damage/<report-id>/photo1.jpg\\ndamage/<report-id>/photo2.jpg"}
          required
        />
      </Field>
      <Button type="submit">Submit Damage</Button>
    </form>
  );
}
