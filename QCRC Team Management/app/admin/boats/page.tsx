import { TopNav } from "@/components/TopNav";
import { getBoats } from "@/lib/queries";

export default async function AdminBoatsPage() {
  const boats = await getBoats();

  return (
    <>
      <TopNav />
      <main className="stack">
        <h1>Admin: Boats</h1>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Type</th>
                <th>Required</th>
                <th>Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
