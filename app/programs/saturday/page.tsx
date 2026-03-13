import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { saveProgramSignupAction } from "@/lib/actions";
import { getProgramSignupState } from "@/lib/queries";

export default async function SaturdayProgramPage() {
  const signups = await getProgramSignupState();
  const isSignedUp = signups.some((s) => s.program_type === "saturday_coached_row");

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Saturday Coached Row" subtitle="Manage your signup status." />
        <Card className="stack">
          <p>
            Current status: <strong>{isSignedUp ? "Signed up" : "Not signed up"}</strong>
          </p>
          <form action={saveProgramSignupAction} className="inline-form">
            <input type="hidden" name="program_type" value="saturday_coached_row" />
            <input type="hidden" name="signed_up" value={isSignedUp ? "false" : "true"} />
            <Button type="submit">{isSignedUp ? "Remove Me" : "Sign Me Up"}</Button>
          </form>
        </Card>
      </main>
    </>
  );
}
