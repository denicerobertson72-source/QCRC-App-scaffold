import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { ReservationActions } from "@/components/ReservationActions";
import { getMyReservations } from "@/lib/queries";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ReservationsPage() {
  const reservations = await getMyReservations();

  return (
    <>
      <TopNav />
      <main className="stack">
        <h1>My Reservations</h1>
        <p>
          <Link href="/reserve">Create a new reservation</Link>
        </p>

        <div className="stack">
          {reservations.length === 0 ? <p>No reservations yet.</p> : null}
          {reservations.map((reservation) => (
            <article key={reservation.id} className="card">
              <h3>{reservation.boats?.name ?? reservation.boat_id}</h3>
              <p>
                {formatDateTime(reservation.start_time)} to {formatDateTime(reservation.end_time)}
              </p>
              <p>Status: {reservation.status}</p>
              <ReservationActions reservation={reservation} />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
