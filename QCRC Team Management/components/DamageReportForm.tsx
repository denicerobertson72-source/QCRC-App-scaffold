import { submitDamageAction } from "@/lib/actions";

export function DamageReportForm() {
  return (
    <form action={submitDamageAction} className="card form-grid">
      <h2>New Damage Report</h2>
      <label>
        Reservation ID (optional)
        <input name="reservation_id" />
      </label>
      <label>
        Boat ID
        <input name="boat_id" required />
      </label>
      <label>
        Severity (1-5)
        <input name="severity" type="number" min={1} max={5} defaultValue={3} required />
      </label>
      <label>
        Responsible Member ID (optional)
        <input name="responsible_member_id" />
      </label>
      <label>
        Description
        <textarea name="description" rows={4} required />
      </label>
      <label>
        Photo storage paths (one per line)
        <textarea
          name="photo_paths"
          rows={4}
          placeholder={"damage/<report-id>/photo1.jpg\\ndamage/<report-id>/photo2.jpg"}
          required
        />
      </label>
      <button type="submit">Submit Damage</button>
    </form>
  );
}
