import Link from "next/link";
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

async function getBoardByType(boardType: string) {
  const { supabase } = await ensureAdminProfile();
  const { data } = await supabase
    .from("lineup_boards")
    .select("id, board_type, title, is_published")
    .eq("board_type", boardType)
    .is("race_event_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

async function BoardSection({
  boardType,
  title,
}: {
  boardType: "saturday_coached_row" | "coached_training_beginner_intermediate" | "coached_training_advanced";
  title: string;
}) {
  const board = await getBoardByType(boardType);

  if (!board) {
    return (
      <Card className="stack">
        <h3>{title}</h3>
        <form action={createLineupBoardAdminAction} className="inline-form">
          <input type="hidden" name="board_type" value={boardType} />
          <input type="hidden" name="title" value={title} />
          <Button type="submit">Create Lineup Board</Button>
        </form>
      </Card>
    );
  }

  const detail = await getLineupBoardDetail(board.id);
  const roster = await getRosterForBoard(boardType);

  return (
    <Card className="stack">
      <div className="page-title">
        <h3>{title}</h3>
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
          <input name="boat_name" required placeholder="Boat name" />
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
  );
}

export default async function AdminLineupsPage() {
  await ensureAdminProfile();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Admin: Lineups" subtitle="Drag and drop rowers into boat seats, then publish." />

        <BoardSection boardType="saturday_coached_row" title="Saturday Coached Row" />
        <BoardSection boardType="coached_training_beginner_intermediate" title="Coached Training: Beginner/Intermediate" />
        <BoardSection boardType="coached_training_advanced" title="Coached Training: Advanced" />

        <Card className="stack">
          <h3>Racing Lineups</h3>
          <p className="muted">Build race-specific lineups from each race page.</p>
          <Link href="/admin/races">Open Races</Link>
        </Card>
      </main>
    </>
  );
}
