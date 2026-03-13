import { TopNav } from "@/components/TopNav";
import { ensureAdminProfile } from "@/lib/auth";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LineupBuilder } from "@/components/admin/LineupBuilder";
import {
  addLineupBoatAdminAction,
  createLineupBoardAdminAction,
  publishLineupBoardAdminAction,
  saveLineupAssignmentsAdminAction,
} from "@/lib/actions";
import { getLineupBoardDetail, getRosterForBoard } from "@/lib/queries";

export default async function RaceLineupPage({ params }: { params: Promise<{ raceId: string }> }) {
  const { raceId } = await params;
  const { supabase } = await ensureAdminProfile();

  const { data: race } = await supabase.from("race_events").select("id, title, event_date").eq("id", raceId).maybeSingle();

  const { data: board } = await supabase
    .from("lineup_boards")
    .select("id, title, is_published")
    .eq("board_type", "racing")
    .eq("race_event_id", raceId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!race) {
    return (
      <>
        <TopNav />
        <main className="stack">
          <Card>Race not found.</Card>
        </main>
      </>
    );
  }

  if (!board) {
    return (
      <>
        <TopNav />
        <main className="stack">
          <PageTitle title={`Race Lineup: ${race.title}`} subtitle={race.event_date} />
          <form action={createLineupBoardAdminAction} className="card form-grid">
            <input type="hidden" name="board_type" value="racing" />
            <input type="hidden" name="race_event_id" value={race.id} />
            <input type="hidden" name="title" value={`${race.title} Lineup`} />
            <Button type="submit">Create Race Lineup Board</Button>
          </form>
        </main>
      </>
    );
  }

  const detail = await getLineupBoardDetail(board.id);
  const roster = await getRosterForBoard("racing", race.id);

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title={`Race Lineup: ${race.title}`} subtitle={race.event_date} />

        <Card className="stack">
          <div className="page-title">
            <h3>{detail.board.title}</h3>
            <form action={publishLineupBoardAdminAction} className="inline-form">
              <input type="hidden" name="lineup_board_id" value={board.id} />
              <input type="hidden" name="publish" value={detail.board.is_published ? "false" : "true"} />
              <Button type="submit" variant="secondary">
                {detail.board.is_published ? "Unpublish" : "Publish"}
              </Button>
            </form>
          </div>

          <form action={addLineupBoatAdminAction} className="inline-form">
            <input type="hidden" name="lineup_board_id" value={board.id} />
            <Field label="Boat Name">
              <input name="boat_name" required />
            </Field>
            <Field label="Class">
              <select name="boat_class_id" defaultValue="4x">
                <option value="1x">1x</option>
                <option value="2x">2x</option>
                <option value="4x">4x</option>
              </select>
            </Field>
            <Button type="submit">Add Boat</Button>
          </form>

          <LineupBuilder boats={detail.boats} roster={roster} action={saveLineupAssignmentsAdminAction} />
        </Card>
      </main>
    </>
  );
}
