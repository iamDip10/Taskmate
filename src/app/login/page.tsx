import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AccessCodeForm from "@/components/AccessCodeForm";

export default function LoginPage() {
  const session = getSession();
  if (session.authenticated) {
    redirect(session.role ? "/" : "/role");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-berry-500 text-2xl shadow-soft">
            🤝
          </div>
          <h1 className="font-display text-3xl italic text-ink">TaskMate</h1>
          <p className="mt-2 text-sm text-ink-soft">A little task board, just for the two of us.</p>
        </div>
        <AccessCodeForm />
      </div>
    </main>
  );
}
