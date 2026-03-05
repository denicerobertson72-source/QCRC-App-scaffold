"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth";

async function assertAdmin() {
  const { supabase, user } = await ensureProfile();
  const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error) throw error;
  if (!data || (data.role !== "admin" && data.role !== "equipment_manager" && data.role !== "coach")) {
    throw new Error("Admin permissions required");
  }
  return { supabase, user };
}

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

export async function updateMemberAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const role = String(formData.get("role") ?? "member");
  const status = String(formData.get("status") ?? "active");
  const membershipType = String(formData.get("membership_type") ?? "community");
  const duesOk = String(formData.get("dues_ok") ?? "false") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      status,
      membership_type: membershipType,
      dues_ok: duesOk,
      waiver_signed_at: duesOk ? new Date().toISOString() : null,
    })
    .eq("id", memberId);

  if (error) throw error;
  revalidatePath("/admin/members");
}

export async function addBoatAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const name = String(formData.get("name") ?? "");
  const boatClassId = String(formData.get("boat_class_id") ?? "");
  const boatType = String(formData.get("boat_type") ?? "training");
  const requiredClearance = Number(formData.get("required_clearance") ?? 1);
  const status = String(formData.get("status") ?? "available");
  const riggingNotes = String(formData.get("rigging_notes") ?? "");

  const { error } = await supabase.from("boats").insert({
    name,
    boat_class_id: boatClassId,
    boat_type: boatType,
    required_clearance: requiredClearance,
    status,
    rigging_notes: riggingNotes || null,
  });

  if (error) throw error;
  revalidatePath("/admin/boats");
  revalidatePath("/boats");
  revalidatePath("/reserve");
}

export async function updateBoatStatusAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const boatId = String(formData.get("boat_id") ?? "");
  const status = String(formData.get("status") ?? "available");

  const { error } = await supabase.from("boats").update({ status }).eq("id", boatId);
  if (error) throw error;

  revalidatePath("/admin/boats");
  revalidatePath("/boats");
  revalidatePath("/reserve");
}

export async function updateClearanceAdminAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const boatClassId = String(formData.get("boat_class_id") ?? "");
  const clearanceLevel = Number(formData.get("clearance_level") ?? 1);

  const { error } = await supabase.from("member_clearances").upsert(
    {
      member_id: memberId,
      boat_class_id: boatClassId,
      clearance_level: clearanceLevel,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    },
    { onConflict: "member_id,boat_class_id" },
  );

  if (error) throw error;
  revalidatePath("/admin/clearances");
  revalidatePath("/reserve");
}

export async function triageDamageAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const damageReportId = String(formData.get("damage_report_id") ?? "");
  const status = String(formData.get("status") ?? "triaged");
  const resolutionNotes = String(formData.get("resolution_notes") ?? "");
  const unlockBoat = String(formData.get("unlock_boat") ?? "false") === "true";
  const laborCostRaw = String(formData.get("labor_cost") ?? "");
  const partsCostRaw = String(formData.get("parts_cost") ?? "");

  const { error } = await supabase.rpc("triage_damage_report", {
    p_damage_report_id: damageReportId,
    p_status: status,
    p_resolution_notes: resolutionNotes || null,
    p_unlock_boat: unlockBoat,
    p_labor_cost: laborCostRaw ? Number(laborCostRaw) : null,
    p_parts_cost: partsCostRaw ? Number(partsCostRaw) : null,
  });

  if (error) throw error;
  revalidatePath("/admin/damage");
  revalidatePath("/admin/analytics");
  revalidatePath("/boats");
  revalidatePath("/reserve");
}
