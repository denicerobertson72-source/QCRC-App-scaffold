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
          <Field label="Required clearance">
            <input name="required_clearance" type="number" min={1} max={4} defaultValue={1} />
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
                <th>Class</th>
                <th>Type</th>
                <th>Required</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {boats.map((boat) => (
                <tr key={boat.id}>
                  <td>{boat.name}</td>
                  <td>{boat.boat_class_id}</td>
                  <td>{boat.boat_type}</td>
                  <td>{boat.required_clearance}</td>
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
