"use client";

import { usePathname } from "next/navigation";
import PortalProvider from "@/components/portal/PortalProvider";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/portal/login";

  if (isLoginPage) {
    return <PortalProvider>{children}</PortalProvider>;
  }

  return (
    <PortalProvider>
      {/* Full-screen portal — sits below the root layout's fixed TopBar + Navbar (38px + 64px mobile / 72px desktop) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 102px)",
        background: "#050505",
        paddingTop: "102px",
      }}
      className="lg:flex-row md:!pt-[110px] md:!min-h-[calc(100vh-110px)]"
      >
        <PortalSidebar />
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </PortalProvider>
  );
}
