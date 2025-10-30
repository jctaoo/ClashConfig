import { Toaster } from "@/client/components/ui/sonner";
import { AppHeader } from "@/client/components/header";
import { ConfigForm } from "@/client/components/config-form";

export default function App() {
  return (
    <div className="min-h-dvh w-full">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <ConfigForm />
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
