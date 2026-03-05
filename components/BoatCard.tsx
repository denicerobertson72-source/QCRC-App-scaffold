import type { Boat } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";

export function BoatCard({ boat }: { boat: Boat }) {
  return (
    <Card className="stack">
      <div className="page-title">
        <h3>
          {boat.name}
          {boat.boat_number ? ` #${boat.boat_number}` : ""}
        </h3>
        <StatusChip label={boat.boat_class_id} />
      </div>
      <p className="muted">
        {boat.boat_type} | skill {boat.required_skill_level} | weight {boat.weight_class ?? "Any"}
      </p>
      <p>
        Status: <strong>{boat.status}</strong>
      </p>
      {boat.rigging_notes ? <Card subtle>{boat.rigging_notes}</Card> : null}
    </Card>
  );
}
