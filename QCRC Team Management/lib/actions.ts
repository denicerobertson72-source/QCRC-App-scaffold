"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth";

function parseCrew(value: FormDataEntryValue | null) {
  if (!value) return [] as string[];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function reserveBoatAction(formData: FormData) {
  const { supabase } = await ensureProfile();

  const boatId = String(formData.get("boat_id") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const checkoutLocation = String(formData.get("checkout_location") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const crew = parseCrew(formData.get("crew"));

  const { error } = await supabase.rpc("reserve_boat", {
    p_boat_id: boatId,
    p_start_time: startTime,
    p_end_time: endTime,
    p_checkout_location: checkoutLocation || null,
    p_notes: notes || null,
    p_crew: crew,
  });

  if (error) throw error;
  revalidatePath("/reservations");
  revalidatePath("/reserve");
}

export async function checkoutAction(formData: FormData) {
  const { supabase } = await ensureProfile();
  const reservationId = String(formData.get("reservation_id") ?? "");
  const location = String(formData.get("location") ?? "");

  const { error } = await supabase.rpc("checkout_reservation", {
    p_reservation_id: reservationId,
    p_location: location || null,
  });

  if (error) throw error;
  revalidatePath("/reservations");
}

export async function checkinAction(formData: FormData) {
  const { supabase } = await ensureProfile();
  const reservationId = String(formData.get("reservation_id") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase.rpc("checkin_reservation", {
    p_reservation_id: reservationId,
    p_notes: notes || null,
  });

  if (error) throw error;
  revalidatePath("/reservations");
}

export async function submitDamageAction(formData: FormData) {
  const { supabase } = await ensureProfile();

  const reservationId = String(formData.get("reservation_id") ?? "");
  const boatId = String(formData.get("boat_id") ?? "");
  const severity = Number(formData.get("severity") ?? 1);
  const description = String(formData.get("description") ?? "");
  const responsibleMemberId = String(formData.get("responsible_member_id") ?? "");
  const rawPaths = String(formData.get("photo_paths") ?? "");
  const photoPaths = rawPaths
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

  const { error } = await supabase.rpc("submit_damage_report", {
    p_reservation_id: reservationId || null,
    p_boat_id: boatId,
    p_severity: severity,
    p_description: description,
    p_photo_paths: photoPaths,
    p_responsible_member_id: responsibleMemberId || null,
  });

  if (error) throw error;

  revalidatePath("/damage/new");
  revalidatePath("/reservations");
  revalidatePath("/admin/damage");
}

export async function signOutAction() {
  const { supabase } = await ensureProfile();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  redirect("/login");
}
