import { ensureProfile } from "@/lib/auth";
import type { Boat, BoatAvailabilityBlock, ProfileSummary, Reservation } from "@/lib/types";

function profileNameFromRelation(profileRelation: unknown) {
  if (Array.isArray(profileRelation)) {
    const first = profileRelation[0] as { full_name?: string } | undefined;
    return first?.full_name ?? "Unknown";
  }
  if (profileRelation && typeof profileRelation === "object") {
    return (profileRelation as { full_name?: string }).full_name ?? "Unknown";
  }
  return "Unknown";
}

export async function getMyReservations() {
  const { supabase, user } = await ensureProfile();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, boat_id, created_by, start_time, end_time, status, checked_out_at, checked_in_at, checkout_location, notes, boats(name)")
    .or(`created_by.eq.${user.id}`)
    .order("start_time", { ascending: true });

  if (error) throw error;

  type ReservationRow = Omit<Reservation, "boats"> & {
    boats: { name: string } | { name: string }[] | null;
  };

  const rows = ((data ?? []) as ReservationRow[]).map((row) => ({
    ...row,
    boats: Array.isArray(row.boats) ? (row.boats[0] ?? null) : row.boats,
  }));

  return rows;
}

export async function getBoats() {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase
    .from("boats")
    .select(
      "id, name, boat_number, photo_url, boat_class_id, boat_type, required_skill_level, weight_class, required_clearance, status, rigging_notes",
    )
    .order("boat_class_id")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Boat[];
}

export async function getMyProfileSummary() {
  const { supabase, user } = await ensureProfile();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, dues_ok, membership_type, skill_level, weight_class")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as ProfileSummary;
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

export async function getBoatAvailabilityBlocks() {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase
    .from("boat_availability_blocks")
    .select("id, title, starts_at, ends_at, applies_to_membership_type, applies_to_boat_class_id, is_active, notes")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BoatAvailabilityBlock[];
}

export async function getProgramSignupState() {
  const { supabase, user } = await ensureProfile();
  const { data, error } = await supabase
    .from("program_signups")
    .select("program_type, training_group")
    .eq("member_id", user.id);

  if (error) throw error;
  return data ?? [];
}

export async function getRaceEventsWithMySignup() {
  const { supabase, user } = await ensureProfile();
  const { data: events, error: eventsError } = await supabase
    .from("race_events")
    .select("id, title, event_date, location, notes")
    .order("event_date", { ascending: true });
  if (eventsError) throw eventsError;

  const { data: signups, error: signupsError } = await supabase
    .from("race_signups")
    .select("race_event_id, birthdate, wants_1x, wants_2x, wants_4x")
    .eq("member_id", user.id);
  if (signupsError) throw signupsError;

  const signupByRace = new Map<string, { birthdate: string; wants_1x: boolean; wants_2x: boolean; wants_4x: boolean }>();
  for (const signup of signups ?? []) {
    signupByRace.set(signup.race_event_id, {
      birthdate: signup.birthdate,
      wants_1x: signup.wants_1x,
      wants_2x: signup.wants_2x,
      wants_4x: signup.wants_4x,
    });
  }

  return (events ?? []).map((event) => ({
    ...event,
    my_signup: signupByRace.get(event.id) ?? null,
  }));
}

export async function getAdminLineupBoards() {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase
    .from("lineup_boards")
    .select("id, board_type, race_event_id, title, is_published, published_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getRosterForBoard(boardType: string, raceEventId?: string) {
  const { supabase } = await ensureProfile();

  if (boardType === "racing") {
    if (!raceEventId) return [];
    const { data, error } = await supabase
      .from("race_signups")
      .select("member_id, profiles(full_name)")
      .eq("race_event_id", raceEventId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.member_id,
      full_name: profileNameFromRelation(row.profiles),
    }));
  }

  if (boardType === "coached_training_beginner_intermediate" || boardType === "coached_training_advanced") {
    const trainingGroup = boardType === "coached_training_beginner_intermediate" ? "beginner_intermediate" : "advanced";
    const { data, error } = await supabase
      .from("program_signups")
      .select("member_id, profiles(full_name)")
      .eq("program_type", "coached_training")
      .eq("training_group", trainingGroup);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.member_id,
      full_name: profileNameFromRelation(row.profiles),
    }));
  }

  const { data, error } = await supabase
    .from("program_signups")
    .select("member_id, profiles(full_name)")
    .eq("program_type", "saturday_coached_row");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.member_id,
    full_name: profileNameFromRelation(row.profiles),
  }));
}

export async function getLineupBoardDetail(lineupBoardId: string) {
  const { supabase } = await ensureProfile();

  const { data: board, error: boardError } = await supabase
    .from("lineup_boards")
    .select("id, board_type, race_event_id, title, is_published")
    .eq("id", lineupBoardId)
    .single();
  if (boardError) throw boardError;

  const { data: boats, error: boatError } = await supabase
    .from("lineup_boats")
    .select("id, lineup_board_id, boat_name, boat_class_id, sort_order")
    .eq("lineup_board_id", lineupBoardId)
    .order("sort_order", { ascending: true });
  if (boatError) throw boatError;

  const boatIds = (boats ?? []).map((b) => b.id);
  const seats = boatIds.length
    ? await (async () => {
        const { data: seatData, error: seatError } = await supabase
          .from("lineup_seats")
          .select("id, lineup_boat_id, seat_number, member_id, profiles(full_name)")
          .in("lineup_boat_id", boatIds)
          .order("seat_number", { ascending: true });
        if (seatError) throw seatError;
        return seatData ?? [];
      })()
    : [];

  const seatsByBoat = new Map<string, typeof seats>();
  for (const seat of seats) {
    const existing = seatsByBoat.get(seat.lineup_boat_id) ?? [];
    existing.push(seat);
    seatsByBoat.set(seat.lineup_boat_id, existing);
  }

  return {
    board,
    boats: (boats ?? []).map((boat) => ({
      ...boat,
      seats: (seatsByBoat.get(boat.id) ?? []).map((seat) => ({
        id: seat.id,
        seat_number: seat.seat_number,
        member_id: seat.member_id,
        member_name: profileNameFromRelation(seat.profiles),
      })),
    })),
  };
}

export async function getPublishedLineups() {
  const { supabase } = await ensureProfile();
  const { data, error } = await supabase
    .from("lineup_boards")
    .select("id, board_type, race_event_id, title, is_published, race_events(title,event_date)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
