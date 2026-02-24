import type { Boat } from "@/lib/types";

export function BoatCard({ boat }: { boat: Boat }) {
  return (
    <article className="card">
      <h3>{boat.name}</h3>
      <p>
        {boat.boat_class_id} | {boat.boat_type} | clearance {boat.required_clearance}
      </p>
      <p>Status: {boat.status}</p>
      {boat.rigging_notes ? <p>{boat.rigging_notes}</p> : null}
    </article>
  );
}
