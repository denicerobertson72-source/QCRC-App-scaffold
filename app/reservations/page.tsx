import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { ReservationActions } from "@/components/ReservationActions";
import { getMyReservations } from "@/lib/queries";
import { StatusChip } from "@/components/ui/StatusChip";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function reservationStatusKind(status: string): "default" | "reserved" | "checked_out" | "checked_in" {
  if (status === "reserved") return "reserved";
  if (status === "checked_out") return "checked_out";
  if (status === "checked_in") return "checked_in";
  return "default";
}

export default async function ReservationsPage() {
  const reservations = await getMyReservations();
  const activeCount = reservations.filter((reservation) => reservation.status === "reserved" || reservation.status === "checked_out").length;

  return (
    <>
      <TopNav />
      <main className="stack">
        <section className="hero-panel stack">
          <span className="eyebrow">Boat Desk</span>
          <PageTitle
            title="My Reservations"
            subtitle={`Active outings: ${activeCount}. Every reservation remains in your permanent club history.`}
            actions={
              <Link href="/reserve" className="cta-link">
                Create a reservation
              </Link>
            }
          />
        </section>

        <div className="stack">
          {reservations.length === 0 ? <Card subtle>No reservations yet.</Card> : null}
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="stack">
              <div className="page-title">
                <h3>{reservation.boats?.name ?? reservation.boat_id}</h3>
                <StatusChip label={reservation.status.replace("_", " ")} kind={reservationStatusKind(reservation.status)} />
              </div>
              <p className="muted">
                {formatDateTime(reservation.start_time)} to {formatDateTime(reservation.end_time)}
              </p>
              <ReservationActions reservation={reservation} />
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
