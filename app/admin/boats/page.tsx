import { TopNav } from "@/components/TopNav";
import { getBoats } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { addBoatAdminAction, updateBoatStatusAdminAction } from "@/lib/actions";

export default async function AdminBoatsPage() {
  const boats = await getBoats();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Admin: Boats" subtitle="Add boats and set out-of-service status." />

        <form action={addBoatAdminAction} className="card form-grid">
          <h3>Add Boat</h3>
          <Field label="Boat name">
            <input name="name" required />
          </Field>
          <Field label="Boat number">
            <input name="boat_number" placeholder="e.g. 3" />
          </Field>
          <Field label="Boat class">
            <select name="boat_class_id" defaultValue="1x">
              <option value="1x">1x</option>
              <option value="2x">2x</option>
              <option value="4x">4x</option>
            </select>
          </Field>
          <Field label="Boat type">
            <input name="boat_type" defaultValue="training" />
          </Field>
          <Field label="Required skill level">
            <select name="required_skill_level" defaultValue="Beginner">
              <option value="LTR">LTR</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Elite">Elite</option>
            </select>
          </Field>
          <Field label="Weight class">
            <select name="weight_class" defaultValue="">
              <option value="">Any</option>
              <option value="Lightweight">Lightweight</option>
              <option value="Mid-weight">Mid-weight</option>
              <option value="Heavyweight">Heavyweight</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="available">
              <option value="available">available</option>
              <option value="maintenance">out of service (maintenance)</option>
              <option value="locked">out of service (locked)</option>
            </select>
          </Field>
          <Field label="Rigging notes">
            <input name="rigging_notes" />
          </Field>
          <Button type="submit">Add Boat</Button>
        </form>

        <Card>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>#</th>
                <th>Class</th>
                <th>Type</th>
                <th>Skill</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {boats.map((boat) => (
                <tr key={boat.id}>
                  <td>{boat.name}</td>
                  <td>{boat.boat_number ?? "-"}</td>
                  <td>{boat.boat_class_id}</td>
                  <td>{boat.boat_type}</td>
                  <td>{boat.required_skill_level}</td>
                  <td>{boat.weight_class ?? "Any"}</td>
                  <td>{boat.status}</td>
                  <td>
                    <form action={updateBoatStatusAdminAction} className="inline-form">
                      <input type="hidden" name="boat_id" value={boat.id} />
                      <select name="status" defaultValue={boat.status}>
                        <option value="available">available</option>
                        <option value="maintenance">out of service</option>
                        <option value="locked">out of service (locked)</option>
                      </select>
                      <Button type="submit" variant="secondary">
                        Save
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
