export type Boat = {
  id: string;
  name: string;
  boat_number: string | null;
  boat_class_id: "1x" | "2x" | "4x" | string;
  boat_type: string;
  required_skill_level: "LTR" | "Beginner" | "Intermediate" | "Advanced" | "Elite" | string;
  weight_class: "Lightweight" | "Mid-weight" | "Heavyweight" | null | string;
  required_clearance: number;
  status: "available" | "maintenance" | "locked" | string;
  rigging_notes: string | null;
};

export type ProfileSummary = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  dues_ok: boolean;
  membership_type: string;
  skill_level: "LTR" | "Beginner" | "Intermediate" | "Advanced" | "Elite" | string;
  weight_class: "Lightweight" | "Mid-weight" | "Heavyweight" | string;
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
