export type Boat = {
  id: string;
  name: string;
  boat_class_id: "1x" | "2x" | "4x" | string;
  boat_type: string;
  required_clearance: number;
  status: "available" | "maintenance" | "locked" | string;
  rigging_notes: string | null;
};

export type Reservation = {
  id: string;
  boat_id: string;
  created_by: string;
  start_time: string;
  end_time: string;
  status: string;
  checked_out_at: string | null;
  checked_in_at: string | null;
  checkout_location: string | null;
  notes: string | null;
  boats?: { name: string } | null;
};
