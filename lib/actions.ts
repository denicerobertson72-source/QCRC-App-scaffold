"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth";
import { easternLocalInputToIso } from "@/lib/time";

function skillLevelToClearance(level: string) {
  switch (level) {
    case "Elite":
      return 4;
    case "Advanced":
      return 3;
    case "Intermediate":
      return 2;
    case "Beginner":
    case "LTR":
    default:
      return 1;
  }
}

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
  const skillLevel = String(formData.get("skill_level") ?? "Beginner");
  const weightClass = String(formData.get("weight_class") ?? "Mid-weight");

  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      status,
      membership_type: membershipType,
      dues_ok: duesOk,
      skill_level: skillLevel,
      weight_class: weightClass,
      waiver_signed_at: duesOk ? new Date().toISOString() : null,
    })
    .eq("id", memberId);

  if (error) throw error;
  revalidatePath("/admin/members");
}

export async function addBoatAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const name = String(formData.get("name") ?? "");
  const boatNumber = String(formData.get("boat_number") ?? "");
  const boatClassId = String(formData.get("boat_class_id") ?? "");
  const boatType = String(formData.get("boat_type") ?? "training");
  const photoUrl = String(formData.get("photo_url") ?? "");
  const requiredSkillLevel = String(formData.get("required_skill_level") ?? "Beginner");
  const weightClass = String(formData.get("weight_class") ?? "");
  const requiredClearance = skillLevelToClearance(requiredSkillLevel);
  const status = String(formData.get("status") ?? "available");
  const riggingNotes = String(formData.get("rigging_notes") ?? "");

  const { error } = await supabase.from("boats").insert({
    name,
    boat_number: boatNumber || null,
    boat_class_id: boatClassId,
    boat_type: boatType,
    photo_url: photoUrl || null,
    required_skill_level: requiredSkillLevel,
    weight_class: weightClass || null,
    required_clearance: requiredClearance,
    status,
    rigging_notes: riggingNotes || null,
  });

  if (error) throw error;
  revalidatePath("/admin/boats");
  revalidatePath("/boats");
  revalidatePath("/reserve");
}

export async function updateBoatAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const boatId = String(formData.get("boat_id") ?? "");
  const name = String(formData.get("name") ?? "");
  const boatNumber = String(formData.get("boat_number") ?? "");
  const boatClassId = String(formData.get("boat_class_id") ?? "");
  const boatType = String(formData.get("boat_type") ?? "training");
  const photoUrl = String(formData.get("photo_url") ?? "");
  const requiredSkillLevel = String(formData.get("required_skill_level") ?? "Beginner");
  const weightClass = String(formData.get("weight_class") ?? "");
  const requiredClearance = skillLevelToClearance(requiredSkillLevel);
  const status = String(formData.get("status") ?? "available");
  const riggingNotes = String(formData.get("rigging_notes") ?? "");

  const { error } = await supabase
    .from("boats")
    .update({
      name,
      boat_number: boatNumber || null,
      boat_class_id: boatClassId,
      boat_type: boatType,
      photo_url: photoUrl || null,
      required_skill_level: requiredSkillLevel,
      weight_class: weightClass || null,
      required_clearance: requiredClearance,
      status,
      rigging_notes: riggingNotes || null,
    })
    .eq("id", boatId);

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

export async function addBoatAvailabilityBlockAdminAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const title = String(formData.get("title") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");
  const membershipType = String(formData.get("applies_to_membership_type") ?? "");
  const boatClassId = String(formData.get("applies_to_boat_class_id") ?? "");
  const isActive = String(formData.get("is_active") ?? "true") === "true";
  const notes = String(formData.get("notes") ?? "");

  const startsAtIso = easternLocalInputToIso(startsAt);
  const endsAtIso = easternLocalInputToIso(endsAt);

  const { error } = await supabase.from("boat_availability_blocks").insert({
    title,
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    applies_to_membership_type: membershipType || null,
    applies_to_boat_class_id: boatClassId || null,
    is_active: isActive,
    notes: notes || null,
    created_by: user.id,
  });

  if (error) throw error;
  revalidatePath("/admin/availability");
  revalidatePath("/reserve");
}

export async function updateBoatAvailabilityBlockAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const blockId = String(formData.get("block_id") ?? "");
  const title = String(formData.get("title") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");
  const membershipType = String(formData.get("applies_to_membership_type") ?? "");
  const boatClassId = String(formData.get("applies_to_boat_class_id") ?? "");
  const isActive = String(formData.get("is_active") ?? "false") === "true";
  const notes = String(formData.get("notes") ?? "");

  const startsAtIso = easternLocalInputToIso(startsAt);
  const endsAtIso = easternLocalInputToIso(endsAt);

  const { error } = await supabase
    .from("boat_availability_blocks")
    .update({
      title,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      applies_to_membership_type: membershipType || null,
      applies_to_boat_class_id: boatClassId || null,
      is_active: isActive,
      notes: notes || null,
    })
    .eq("id", blockId);

  if (error) throw error;
  revalidatePath("/admin/availability");
  revalidatePath("/reserve");
}

export async function saveProgramSignupAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const programType = String(formData.get("program_type") ?? "");
  const trainingGroup = String(formData.get("training_group") ?? "");
  const signedUp = String(formData.get("signed_up") ?? "true") === "true";

  if (!signedUp) {
    const { error } = await supabase
      .from("program_signups")
      .delete()
      .eq("member_id", user.id)
      .eq("program_type", programType);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("program_signups").upsert(
      {
        member_id: user.id,
        program_type: programType,
        training_group: trainingGroup || null,
      },
      { onConflict: "member_id,program_type" },
    );
    if (error) throw error;
  }

  revalidatePath("/programs");
  revalidatePath("/admin/lineups");
}

export async function addRaceEventAdminAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const title = String(formData.get("title") ?? "");
  const eventDate = String(formData.get("event_date") ?? "");
  const location = String(formData.get("location") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase.from("race_events").insert({
    title,
    event_date: eventDate,
    location: location || null,
    notes: notes || null,
    created_by: user.id,
  });
  if (error) throw error;

  revalidatePath("/programs/racing");
  revalidatePath("/admin/races");
}

export async function saveRaceSignupAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const raceEventId = String(formData.get("race_event_id") ?? "");
  const attending = String(formData.get("attending") ?? "true") === "true";
  const birthdate = String(formData.get("birthdate") ?? "");
  const wants1x = String(formData.get("wants_1x") ?? "false") === "true";
  const wants2x = String(formData.get("wants_2x") ?? "false") === "true";
  const wants4x = String(formData.get("wants_4x") ?? "false") === "true";

  if (!attending) {
    const { error } = await supabase
      .from("race_signups")
      .delete()
      .eq("race_event_id", raceEventId)
      .eq("member_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("race_signups").upsert(
      {
        race_event_id: raceEventId,
        member_id: user.id,
        birthdate,
        wants_1x: wants1x,
        wants_2x: wants2x,
        wants_4x: wants4x,
      },
      { onConflict: "race_event_id,member_id" },
    );
    if (error) throw error;
  }

  revalidatePath("/programs/racing");
  revalidatePath("/admin/races");
  revalidatePath("/admin/lineups");
}

export async function createLineupBoardAdminAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const boardType = String(formData.get("board_type") ?? "");
  const raceEventId = String(formData.get("race_event_id") ?? "");
  const sessionId = String(formData.get("session_id") ?? "");
  const title = String(formData.get("title") ?? "");
  const returnTo = String(formData.get("return_to") ?? "");

  const payload = {
    board_type: boardType,
    race_event_id: raceEventId || null,
    session_id: sessionId || null,
    title,
    created_by: user.id,
  };

  const { error } = await supabase.from("lineup_boards").insert(payload);
  if (error) throw error;

  revalidatePath("/admin/lineups");
  revalidatePath("/admin/races");
  if (returnTo) redirect(returnTo);
}

function seatCountFromClass(boatClassId: string) {
  if (boatClassId === "2x") return 2;
  if (boatClassId === "4x") return 4;
  return 1;
}

export async function addLineupBoatAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const lineupBoardId = String(formData.get("lineup_board_id") ?? "");
  const boatName = String(formData.get("boat_name") ?? "");
  const boatClassId = String(formData.get("boat_class_id") ?? "4x");
  const returnTo = String(formData.get("return_to") ?? "");

  const { data: existingBoats, error: existingError } = await supabase
    .from("lineup_boats")
    .select("sort_order")
    .eq("lineup_board_id", lineupBoardId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (existingError) throw existingError;
  const nextSortOrder = (existingBoats?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("lineup_boats")
    .insert({
      lineup_board_id: lineupBoardId,
      boat_name: boatName,
      boat_class_id: boatClassId,
      sort_order: nextSortOrder,
    })
    .select("id")
    .single();
  if (error) throw error;

  const seatCount = seatCountFromClass(boatClassId);
  const seatRows = Array.from({ length: seatCount }, (_, idx) => ({
    lineup_boat_id: data.id,
    seat_number: idx + 1,
    member_id: null as string | null,
  }));

  const { error: seatError } = await supabase.from("lineup_seats").insert(seatRows);
  if (seatError) throw seatError;

  revalidatePath("/admin/lineups");
  revalidatePath("/admin/races");
  if (returnTo) redirect(returnTo);
}

export async function saveLineupAssignmentsAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const assignmentJson = String(formData.get("assignments_json") ?? "[]");
  const returnTo = String(formData.get("return_to") ?? "");
  const assignments = JSON.parse(assignmentJson) as { seatId: string; memberId: string | null }[];

  for (const item of assignments) {
    const { error } = await supabase
      .from("lineup_seats")
      .update({ member_id: item.memberId })
      .eq("id", item.seatId);
    if (error) throw error;
  }

  revalidatePath("/admin/lineups");
  revalidatePath("/admin/races");
  revalidatePath("/lineups");
  if (returnTo) redirect(returnTo);
}

export async function publishLineupBoardAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const lineupBoardId = String(formData.get("lineup_board_id") ?? "");
  const publish = String(formData.get("publish") ?? "true") === "true";
  const returnTo = String(formData.get("return_to") ?? "");

  const { error } = await supabase
    .from("lineup_boards")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", lineupBoardId);
  if (error) throw error;

  revalidatePath("/admin/lineups");
  revalidatePath("/admin/races");
  revalidatePath("/lineups");
  if (returnTo) redirect(returnTo);
}

export async function updateLineupBoatRaceTimeAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const lineupBoatId = String(formData.get("lineup_boat_id") ?? "");
  const raceTime = String(formData.get("race_time") ?? "");
  const returnTo = String(formData.get("return_to") ?? "");
  const raceTimeIso = easternLocalInputToIso(raceTime);

  const { error } = await supabase
    .from("lineup_boats")
    .update({ race_time: raceTimeIso })
    .eq("id", lineupBoatId);
  if (error) throw error;

  revalidatePath("/admin/races");
  revalidatePath("/admin/lineups");
  revalidatePath("/lineups");
  if (returnTo) redirect(returnTo);
}

export async function toggleSessionSignupAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const sessionId = String(formData.get("session_id") ?? "");
  const signedUp = String(formData.get("signed_up") ?? "true") === "true";

  if (signedUp) {
    const { error } = await supabase.from("session_signups").upsert(
      {
        session_id: sessionId,
        member_id: user.id,
      },
      { onConflict: "session_id,member_id" },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("session_signups")
      .delete()
      .eq("session_id", sessionId)
      .eq("member_id", user.id);
    if (error) throw error;
  }

  revalidatePath("/programs/saturday");
  revalidatePath("/programs/training");
  revalidatePath("/programs/training/beginner-intermediate");
  revalidatePath("/programs/training/advanced");
  revalidatePath("/admin/programs");
}

export async function cancelSessionAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const sessionId = String(formData.get("session_id") ?? "");
  const isCancelled = String(formData.get("is_cancelled") ?? "true") === "true";
  const cancelledReason = String(formData.get("cancelled_reason") ?? "");

  const { error } = await supabase
    .from("sessions")
    .update({
      is_cancelled: isCancelled,
      cancelled_reason: isCancelled ? cancelledReason || "Cancelled by coach/admin" : null,
    })
    .eq("id", sessionId);
  if (error) throw error;

  revalidatePath("/programs/saturday");
  revalidatePath("/programs/training");
  revalidatePath("/programs/training/beginner-intermediate");
  revalidatePath("/programs/training/advanced");
  revalidatePath("/admin/programs");
}

function monthWindowFromInput(monthInput: string) {
  const fallback = new Date();
  const [yearRaw, monthRaw] = monthInput.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const safeYear = Number.isFinite(year) && year > 2000 ? year : fallback.getFullYear();
  const safeMonthIndex = Number.isFinite(month) && month >= 1 && month <= 12 ? month - 1 : fallback.getMonth();
  const start = new Date(Date.UTC(safeYear, safeMonthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(safeYear, safeMonthIndex + 1, 1, 0, 0, 0));
  return { start, end };
}

export async function generateProgramSessionsMonthAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();
  const monthInput = String(formData.get("month") ?? "");
  const { start, end } = monthWindowFromInput(monthInput);

  const { data: existing, error: existingError } = await supabase
    .from("sessions")
    .select("session_type, starts_at")
    .in("session_type", [
      "saturday_coached_row",
      "coached_training_beginner_intermediate",
      "coached_training_advanced",
    ])
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString());
  if (existingError) throw existingError;

  const existingKeys = new Set((existing ?? []).map((s) => `${s.session_type}|${new Date(s.starts_at).toISOString()}`));
  const rows: Array<{
    title: string;
    session_type: string;
    starts_at: string;
    ends_at: string;
    created_by: string;
    is_cancelled: boolean;
  }> = [];

  const year = start.getUTCFullYear();
  const monthIndex = start.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === 6) {
      const startsAt = easternLocalInputToIso(
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00`,
      ) as string;
      const key = `saturday_coached_row|${new Date(startsAt).toISOString()}`;
      if (!existingKeys.has(key)) {
        rows.push({
          title: "Saturday Coached Row",
          session_type: "saturday_coached_row",
          starts_at: startsAt,
          ends_at: easternLocalInputToIso(
            `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:30`,
          ) as string,
          created_by: user.id,
          is_cancelled: false,
        });
      }
    }

    if (dayOfWeek === 1 || dayOfWeek === 4) {
      const startsAt = easternLocalInputToIso(
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T17:30`,
      ) as string;
      const key = `coached_training_beginner_intermediate|${new Date(startsAt).toISOString()}`;
      if (!existingKeys.has(key)) {
        rows.push({
          title: "Coached Training (Beginner/Intermediate)",
          session_type: "coached_training_beginner_intermediate",
          starts_at: startsAt,
          ends_at: easternLocalInputToIso(
            `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T18:45`,
          ) as string,
          created_by: user.id,
          is_cancelled: false,
        });
      }
    }

    if (dayOfWeek === 2 || dayOfWeek === 4) {
      const startsAt = easternLocalInputToIso(
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T06:30`,
      ) as string;
      const key = `coached_training_advanced|${new Date(startsAt).toISOString()}`;
      if (!existingKeys.has(key)) {
        rows.push({
          title: "Coached Training (Advanced)",
          session_type: "coached_training_advanced",
          starts_at: startsAt,
          ends_at: easternLocalInputToIso(
            `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T07:45`,
          ) as string,
          created_by: user.id,
          is_cancelled: false,
        });
      }
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("sessions").insert(rows);
    if (error) throw error;
  }

  revalidatePath("/programs/saturday");
  revalidatePath("/programs/training");
  revalidatePath("/programs/training/beginner-intermediate");
  revalidatePath("/programs/training/advanced");
  revalidatePath("/admin/programs");
}

export async function updateSessionTimesAdminAction(formData: FormData) {
  const { supabase } = await assertAdmin();
  const sessionId = String(formData.get("session_id") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");

  const startsAtIso = easternLocalInputToIso(startsAt);
  const endsAtIso = easternLocalInputToIso(endsAt);

  const { error } = await supabase
    .from("sessions")
    .update({
      starts_at: startsAtIso,
      ends_at: endsAtIso,
    })
    .eq("id", sessionId);
  if (error) throw error;

  revalidatePath("/programs/saturday");
  revalidatePath("/programs/training");
  revalidatePath("/programs/training/beginner-intermediate");
  revalidatePath("/programs/training/advanced");
  revalidatePath("/admin/programs");
}
