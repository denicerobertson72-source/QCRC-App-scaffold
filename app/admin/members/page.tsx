import { TopNav } from "@/components/TopNav";
import { ensureSiteAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";
import { MemberAdminForm } from "@/components/admin/MemberAdminForm";

export default async function AdminMembersPage() {
  const { supabase } = await ensureSiteAdmin();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, status, dues_ok, dues_renewal_date, membership_type, skill_level, weight_class, owns_private_boat, boat_storage_fee_ok, boat_storage_fee_renewal_date",
    )
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

              <MemberAdminForm member={m} />
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
