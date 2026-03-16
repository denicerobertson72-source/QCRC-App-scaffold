import { cancelReservationAction, checkinAction, checkoutAction, updateReservationAction } from "@/lib/actions";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { toEasternDateTimeLocalValue } from "@/lib/time";

export function ReservationActions({ reservation }: { reservation: Reservation }) {
  const canCheckout = reservation.status === "reserved";
  const canCheckin = reservation.status === "checked_out";
  const canEdit = reservation.status === "reserved";

  return (
    <div className="stack">
      {canEdit ? (
        <div className="card-subtle stack">
          <form action={updateReservationAction} className="form-grid">
            <input type="hidden" name="reservation_id" value={reservation.id} />
            <label>
              Start
              <input name="start_time" type="datetime-local" defaultValue={toEasternDateTimeLocalValue(reservation.start_time)} required />
            </label>
            <label>
              End
              <input name="end_time" type="datetime-local" defaultValue={toEasternDateTimeLocalValue(reservation.end_time)} required />
            </label>
            <label>
              Location
              <input name="checkout_location" defaultValue={reservation.checkout_location ?? ""} placeholder="Main Dock" />
            </label>
            <label>
              Crew Names
              <input name="crew_names" placeholder="Jane Doe, Sam Smith" />
            </label>
            <label>
              Notes
              <input name="notes" defaultValue={reservation.notes ?? ""} />
            </label>
            <Button type="submit" variant="secondary">
              Save Changes
            </Button>
          </form>
          <div className="row">
            <form action={cancelReservationAction}>
              <input type="hidden" name="reservation_id" value={reservation.id} />
              <Button type="submit" variant="secondary">
                Cancel Reservation
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="row">
        {canCheckout ? (
          <form action={checkoutAction} className="inline-form">
            <input type="hidden" name="reservation_id" value={reservation.id} />
            <select name="location" defaultValue={reservation.checkout_location ?? "OH"} required>
              <option value="OH">OH</option>
              <option value="LM">LM</option>
            </select>
            <select name="river_direction" defaultValue={reservation.river_direction ?? "Upriver"} required>
              <option value="Upriver">Upriver</option>
              <option value="Downriver">Downriver</option>
            </select>
            <Button type="submit">Launching</Button>
          </form>
        ) : null}

        {canCheckin ? (
          <form action={checkinAction} className="inline-form">
            <input type="hidden" name="reservation_id" value={reservation.id} />
            <input name="notes" placeholder="Condition notes" />
            <Button type="submit">Returned</Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
