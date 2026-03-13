import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { saveProgramSignupAction } from "@/lib/actions";
import { getProgramSignupState } from "@/lib/queries";

export default async function TrainingProgramPage() {
  const signups = await getProgramSignupState();
  const current = signups.find((s) => s.program_type === "coached_training");

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Coached Training" subtitle="Choose your training group." />

        <Card className="stack">
          <p>
            Current group: <strong>{current?.training_group === "advanced" ? "Advanced" : current ? "Beginner/Intermediate" : "Not signed up"}</strong>
          </p>

          <div className="row">
            <form action={saveProgramSignupAction} className="inline-form">
              <input type="hidden" name="program_type" value="coached_training" />
              <input type="hidden" name="training_group" value="beginner_intermediate" />
              <input type="hidden" name="signed_up" value="true" />
              <Button type="submit">Beginner/Intermediate</Button>
            </form>

            <form action={saveProgramSignupAction} className="inline-form">
              <input type="hidden" name="program_type" value="coached_training" />
              <input type="hidden" name="training_group" value="advanced" />
              <input type="hidden" name="signed_up" value="true" />
              <Button type="submit">Advanced</Button>
            </form>

            {current ? (
              <form action={saveProgramSignupAction} className="inline-form">
                <input type="hidden" name="program_type" value="coached_training" />
                <input type="hidden" name="signed_up" value="false" />
                <Button type="submit" variant="secondary">
                  Remove Me
                </Button>
              </form>
            ) : null}
          </div>
        </Card>
      </main>
    </>
  );
}
