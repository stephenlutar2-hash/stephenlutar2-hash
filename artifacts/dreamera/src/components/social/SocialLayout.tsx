import type { ReactNode } from "react";
import SocialSidebar from "./SocialSidebar";

interface SocialLayoutProps {
  children: ReactNode;
}

export default function SocialLayout({ children }: SocialLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SocialSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
