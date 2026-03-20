import { TopNav } from "@/components/TopNav";
import { DamageReportForm } from "@/components/DamageReportForm";
import { FlashNotice } from "@/components/ui/FlashNotice";

type SearchParams = Promise<{
  damage_status?: string;
  damage_message?: string;
}>;

export default async function NewDamagePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.damage_status === "error" ? "error" : params.damage_status === "success" ? "success" : null;
  const message = params.damage_message ?? "";

  return (
    <>
      <TopNav />
      <main className="stack">
        {status && message ? <FlashNotice status={status} message={message} /> : null}
        <DamageReportForm />
      </main>
    </>
  );
}
