import PortalProvider from "@/components/portal/PortalProvider";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      {/* Full-screen portal — sits below the root layout's Navbar */}
      <div style={{
        display: "flex",
        minHeight: "calc(100vh - 72px)",
        background: "#050505",
      }}>
        <PortalSidebar />
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </PortalProvider>
  );
}
