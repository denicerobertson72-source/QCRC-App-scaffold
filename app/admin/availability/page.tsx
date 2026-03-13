import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  addBoatAvailabilityBlockAdminAction,
  updateBoatAvailabilityBlockAdminAction,
} from "@/lib/actions";
import { getBoatAvailabilityBlocks } from "@/lib/queries";
import { toEasternDateTimeLocalValue } from "@/lib/time";

function toInputDateTime(value: string) {
  return toEasternDateTimeLocalValue(value);
}

export default async function AdminAvailabilityPage() {
  const blocks = await getBoatAvailabilityBlocks();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle
          title="Admin: Availability Blocks"
          subtitle="Block reservation windows across all boats (or specific classes/groups) in one place."
        />

        <form action={addBoatAvailabilityBlockAdminAction} className="card form-grid">
          <h3>Add Block</h3>
          <Field label="Title">
            <input name="title" required placeholder="Youth practice" />
          </Field>
          <Field label="Starts">
            <input name="starts_at" type="datetime-local" required />
          </Field>
          <Field label="Ends">
            <input name="ends_at" type="datetime-local" required />
          </Field>
          <Field label="Membership group (optional)">
            <input name="applies_to_membership_type" placeholder="masters" />
          </Field>
          <Field label="Boat class (optional)">
            <select name="applies_to_boat_class_id" defaultValue="">
              <option value="">All</option>
              <option value="1x">1x</option>
              <option value="2x">2x</option>
              <option value="4x">4x</option>
            </select>
          </Field>
          <Field label="Active">
            <select name="is_active" defaultValue="true">
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </Field>
          <Field label="Notes">
            <input name="notes" placeholder="Seasonal schedule block" />
          </Field>
          <Button type="submit">Save Block</Button>
        </form>

        <div className="grid">
          {blocks.map((block) => (
            <form key={block.id} action={updateBoatAvailabilityBlockAdminAction} className="card form-grid">
              <h3>{block.title}</h3>
              <input type="hidden" name="block_id" value={block.id} />
              <Field label="Title">
                <input name="title" defaultValue={block.title} required />
              </Field>
              <Field label="Starts">
                <input name="starts_at" type="datetime-local" defaultValue={toInputDateTime(block.starts_at)} required />
              </Field>
              <Field label="Ends">
                <input name="ends_at" type="datetime-local" defaultValue={toInputDateTime(block.ends_at)} required />
              </Field>
              <Field label="Membership group (optional)">
                <input name="applies_to_membership_type" defaultValue={block.applies_to_membership_type ?? ""} />
              </Field>
              <Field label="Boat class (optional)">
                <select name="applies_to_boat_class_id" defaultValue={block.applies_to_boat_class_id ?? ""}>
                  <option value="">All</option>
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="4x">4x</option>
                </select>
              </Field>
              <Field label="Active">
                <select name="is_active" defaultValue={block.is_active ? "true" : "false"}>
                  <option value="true">active</option>
                  <option value="false">inactive</option>
                </select>
              </Field>
              <Field label="Notes">
                <input name="notes" defaultValue={block.notes ?? ""} />
              </Field>
              <Button type="submit" variant="secondary">
                Update Block
              </Button>
            </form>
          ))}
        </div>
      </main>
    </>
  );
}
