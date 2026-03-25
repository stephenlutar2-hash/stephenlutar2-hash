import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
