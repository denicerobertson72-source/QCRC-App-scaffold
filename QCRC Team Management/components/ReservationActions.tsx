import { checkinAction, checkoutAction } from "@/lib/actions";
import type { Reservation } from "@/lib/types";

export function ReservationActions({ reservation }: { reservation: Reservation }) {
  const canCheckout = reservation.status === "reserved";
  const canCheckin = reservation.status === "checked_out";

  return (
    <div className="row">
      {canCheckout ? (
        <form action={checkoutAction} className="inline-form">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <input name="location" placeholder="Dock" />
          <button type="submit">Check Out</button>
        </form>
      ) : null}

      {canCheckin ? (
        <form action={checkinAction} className="inline-form">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <input name="notes" placeholder="Condition notes" />
          <button type="submit">Check In</button>
        </form>
      ) : null}
    </div>
  );
}
