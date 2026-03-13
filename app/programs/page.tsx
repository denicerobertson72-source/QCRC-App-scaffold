import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";

export default function ProgramsPage() {
  return (
    <>
      <TopNav />
      <main className="stack">
        <PageTitle title="Programs" subtitle="Sign up for coached rows, training, and racing." />
        <div className="grid">
          <Card className="stack">
            <h3>Saturday Coached Row</h3>
            <p className="muted">General coached session signup roster.</p>
            <Link href="/programs/saturday">Open Signup</Link>
          </Card>
          <Card className="stack">
            <h3>Coached Training</h3>
            <p className="muted">Choose Beginner/Intermediate or Advanced training group.</p>
            <Link href="/programs/training">Open Signup</Link>
          </Card>
          <Card className="stack">
            <h3>Racing</h3>
            <p className="muted">Select races, add birthdate, and choose preferred boat classes.</p>
            <Link href="/programs/racing">Open Signup</Link>
          </Card>
        </div>
      </main>
    </>
  );
}
