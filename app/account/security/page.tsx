import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { ensureProfile } from "@/lib/auth";
import { SetPasswordForm } from "@/components/account/SetPasswordForm";

export default async function AccountSecurityPage() {
  await ensureProfile();

  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Account Security" subtitle="Set a password so you can sign in directly without waiting for magic links." />
        <SetPasswordForm />
      </main>
    </>
  );
}
