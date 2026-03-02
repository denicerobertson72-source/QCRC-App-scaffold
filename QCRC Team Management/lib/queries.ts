import { ensureProfile } from "@/lib/auth";
import type { Boat, Reservation } from "@/lib/types";

export async function getMyReservations() {
  const { supabase, user } = await ensureProfile();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, boat_id, created_by, start_time, end_time, status, checked_out_at, checked_in_at, checkout_location, notes, boats(name)")
    .or(`created_by.eq.${user.id}`)
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Reservation[];
}

export async function getBoats() {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase
    .from("boats")
    .select("id, name, boat_class_id, boat_type, required_clearance, status, rigging_notes")
    .order("boat_class_id")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Boat[];
}

export async function getAvailableBoats(start: string, end: string, boatClassId?: string) {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase.rpc("available_boats_for_window", {
    p_start_time: start,
    p_end_time: end,
    p_boat_class_id: boatClassId || null,
  });

  if (error) throw error;
  return (data ?? []) as Boat[];
}
