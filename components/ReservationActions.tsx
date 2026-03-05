import { checkinAction, checkoutAction } from "@/lib/actions";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function ReservationActions({ reservation }: { reservation: Reservation }) {
  const canCheckout = reservation.status === "reserved";
  const canCheckin = reservation.status === "checked_out";

  return (
    <div className="row">
      {canCheckout ? (
        <form action={checkoutAction} className="inline-form">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <input name="location" placeholder="Dock" />
          <Button type="submit">Check Out</Button>
        </form>
      ) : null}

      {canCheckin ? (
        <form action={checkinAction} className="inline-form">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <input name="notes" placeholder="Condition notes" />
          <Button type="submit">Check In</Button>
        </form>
      ) : null}
    </div>
  );
}
