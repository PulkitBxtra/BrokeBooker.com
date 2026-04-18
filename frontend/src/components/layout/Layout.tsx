import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
