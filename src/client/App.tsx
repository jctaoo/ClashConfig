import { Toaster } from "@/client/components/ui/sonner";
import { AppHeader } from "@/client/components/header";
import { ConfigForm } from "@/client/components/config-form";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-dvh w-full">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ConfigForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
