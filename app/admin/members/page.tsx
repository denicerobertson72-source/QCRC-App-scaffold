import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateMemberAdminAction } from "@/lib/actions";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";

export default async function AdminMembersPage() {
  const { supabase } = await ensureProfile();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, status, dues_ok, membership_type")
    .order("full_name");

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Admin: Members" subtitle="Add members, update dues/status/role, and remove access." />

        <InviteMemberForm />

        <div className="stack">
          {(data ?? []).map((m) => (
            <Card key={m.id} className="stack">
              <div className="page-title">
                <h3>{m.full_name}</h3>
                <span className="muted">{m.email}</span>
              </div>

              <form action={updateMemberAdminAction} className="form-grid">
                <input type="hidden" name="member_id" value={m.id} />

                <Field label="Role">
                  <select name="role" defaultValue={m.role}>
                    <option value="member">member</option>
                    <option value="coach">coach</option>
                    <option value="equipment_manager">equipment_manager</option>
                    <option value="admin">admin</option>
                  </select>
                </Field>

                <Field label="Status">
                  <select name="status" defaultValue={m.status}>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="inactive">inactive (removed)</option>
                  </select>
                </Field>

                <Field label="Membership Type">
                  <select name="membership_type" defaultValue={m.membership_type}>
                    <option value="community">community</option>
                    <option value="competitive">competitive</option>
                    <option value="ltr">ltr</option>
                  </select>
                </Field>

                <Field label="Dues">
                  <select name="dues_ok" defaultValue={m.dues_ok ? "true" : "false"}>
                    <option value="true">paid</option>
                    <option value="false">due</option>
                  </select>
                </Field>

                <div className="row">
                  <Button type="submit">Save Member</Button>
                  <Button type="submit" variant="secondary" name="status" value="inactive">
                    Remove Access
                  </Button>
                </div>
              </form>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
