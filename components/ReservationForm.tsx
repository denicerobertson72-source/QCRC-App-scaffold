import { reserveBoatAction } from "@/lib/actions";
import type { Boat } from "@/lib/types";

export function ReservationForm({ boat, start, end }: { boat: Boat; start: string; end: string }) {
  return (
    <form action={reserveBoatAction} className="card form-grid">
      <h3>Reserve {boat.name}</h3>
      <input type="hidden" name="boat_id" value={boat.id} />
      <label>
        Start
        <input name="start_time" type="datetime-local" defaultValue={start} required />
      </label>
      <label>
        End
        <input name="end_time" type="datetime-local" defaultValue={end} required />
      </label>
      <label>
        Crew IDs (comma-separated UUIDs)
        <input name="crew" placeholder="uuid1,uuid2" />
      </label>
      <label>
        Location
        <input name="checkout_location" placeholder="Main Dock" />
      </label>
      <label>
        Notes
        <input name="notes" />
      </label>
      <button type="submit">Book</button>
    </form>
  );
}
