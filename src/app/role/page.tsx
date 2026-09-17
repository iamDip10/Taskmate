import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import RoleSelect from "@/components/RoleSelect";

export default function RolePage() {
  const session = getSession();
  if (!session.authenticated) redirect("/login");
  if (session.role) redirect("/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl italic text-ink">Who's this?</h1>
        <p className="mt-2 text-sm text-ink-soft">TaskMate will remember your choice on this device.</p>

        <RoleSelect />
      </div>
    </main>
  );
}
