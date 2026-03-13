import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getProgramSessionsForMonth } from "@/lib/queries";
import { toggleSessionSignupAction } from "@/lib/actions";

type SearchParams = Promise<{ month?: string }>;

function monthBounds(monthInput?: string) {
  const now = new Date();
  const [yearRaw, monthRaw] = (monthInput ?? "").split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const safeYear = Number.isFinite(year) && year > 2000 ? year : now.getUTCFullYear();
  const safeMonthIndex = Number.isFinite(month) && month >= 1 && month <= 12 ? month - 1 : now.getUTCMonth();

  const start = new Date(Date.UTC(safeYear, safeMonthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(safeYear, safeMonthIndex + 1, 1, 0, 0, 0));
  const prev = new Date(Date.UTC(safeYear, safeMonthIndex - 1, 1, 0, 0, 0));
  const next = new Date(Date.UTC(safeYear, safeMonthIndex + 1, 1, 0, 0, 0));

  const label = start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  return { start, end, label, current: fmt(start), prev: fmt(prev), next: fmt(next) };
}

function prettyDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionRow({
  session,
}: {
  session: {
    id: string;
    starts_at: string;
    signup_count: number;
    my_signed_up: boolean;
    is_cancelled: boolean;
    cancelled_reason: string | null;
  };
}) {
  return (
    <Card key={session.id} className="stack">
      <h4>{prettyDateTime(session.starts_at)}</h4>
      <p className="muted">Signups: {session.signup_count}</p>

      {session.is_cancelled ? (
        <p className="error">Cancelled{session.cancelled_reason ? `: ${session.cancelled_reason}` : ""}</p>
      ) : (
        <form action={toggleSessionSignupAction} className="inline-form">
          <input type="hidden" name="session_id" value={session.id} />
          <input type="hidden" name="signed_up" value={session.my_signed_up ? "false" : "true"} />
          <Button type="submit">{session.my_signed_up ? "Remove Me" : "Sign Me Up"}</Button>
        </form>
      )}
    </Card>
  );
}

export default async function TrainingProgramPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const month = monthBounds(params.month);
  const sessions = await getProgramSessionsForMonth(
    ["coached_training_beginner_intermediate", "coached_training_advanced"],
    month.start.toISOString(),
    month.end.toISOString(),
  );

  const bi = sessions.filter((s) => s.session_type === "coached_training_beginner_intermediate");
  const advanced = sessions.filter((s) => s.session_type === "coached_training_advanced");

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Coached Training" subtitle={`Signups for ${month.label}`} />

        <div className="row">
          <Link href={`/programs/training?month=${month.prev}`}>Previous Month</Link>
          <Link href={`/programs/training?month=${month.next}`}>Next Month</Link>
        </div>

        <Card className="stack">
          <h3>Beginner/Intermediate (Mon + Thu at 5:30 PM)</h3>
          {bi.length === 0 ? <Card subtle>No sessions for this month yet.</Card> : null}
          {bi.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </Card>

        <Card className="stack">
          <h3>Advanced (Tue + Thu at 6:30 AM)</h3>
          {advanced.length === 0 ? <Card subtle>No sessions for this month yet.</Card> : null}
          {advanced.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </Card>
      </main>
    </>
  );
}
