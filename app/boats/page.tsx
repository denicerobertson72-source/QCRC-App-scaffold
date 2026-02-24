import { TopNav } from "@/components/TopNav";
import { BoatCard } from "@/components/BoatCard";
import { getBoats } from "@/lib/queries";

export default async function BoatsPage() {
  const boats = await getBoats();

  return (
    <>
      <TopNav />
      <main className="stack">
        <h1>Boats</h1>
        <div className="grid">
          {boats.map((boat) => (
            <BoatCard key={boat.id} boat={boat} />
          ))}
        </div>
      </main>
    </>
  );
}
