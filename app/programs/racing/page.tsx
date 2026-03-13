import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { saveRaceSignupAction } from "@/lib/actions";
import { getRaceEventsWithMySignup } from "@/lib/queries";

export default async function RacingProgramPage() {
  const events = await getRaceEventsWithMySignup();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Racing Signups" subtitle="Pick races, enter birthdate, and choose your preferred boat classes." />

        <div className="stack">
          {events.length === 0 ? <Card subtle>No races posted yet.</Card> : null}

          {events.map((event) => (
            <Card key={event.id} className="stack">
              <h3>{event.title}</h3>
              <p className="muted">
                {event.event_date}
                {event.location ? ` | ${event.location}` : ""}
              </p>

              <form action={saveRaceSignupAction} className="form-grid">
                <input type="hidden" name="race_event_id" value={event.id} />

                <Field label="Birthdate">
                  <input name="birthdate" type="date" defaultValue={event.my_signup?.birthdate ?? ""} required />
                </Field>

                <div className="row">
                  <label>
                    <input type="checkbox" name="wants_1x" value="true" defaultChecked={Boolean(event.my_signup?.wants_1x)} /> 1x
                  </label>
                  <label>
                    <input type="checkbox" name="wants_2x" value="true" defaultChecked={Boolean(event.my_signup?.wants_2x)} /> 2x
                  </label>
                  <label>
                    <input type="checkbox" name="wants_4x" value="true" defaultChecked={Boolean(event.my_signup?.wants_4x)} /> 4x
                  </label>
                </div>

                <div className="row">
                  <input type="hidden" name="attending" value="true" />
                  <Button type="submit">Save Race Signup</Button>
                </div>
              </form>

              {event.my_signup ? (
                <form action={saveRaceSignupAction}>
                  <input type="hidden" name="race_event_id" value={event.id} />
                  <input type="hidden" name="attending" value="false" />
                  <Button type="submit" variant="secondary">
                    Remove From This Race
                  </Button>
                </form>
              ) : null}
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
