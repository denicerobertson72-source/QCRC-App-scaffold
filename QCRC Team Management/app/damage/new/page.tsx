import { TopNav } from "@/components/TopNav";
import { DamageReportForm } from "@/components/DamageReportForm";

export default function NewDamagePage() {
  return (
    <>
      <TopNav />
      <main className="stack">
        <DamageReportForm />
      </main>
    </>
  );
}
