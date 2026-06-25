/* ============================================================
   LAYOUT COMPONENT
   Shared wrapper: Nav + Footer around page content.
   Responsive: sidebar on desktop, bottom nav on mobile.
   ============================================================ */

import Nav from "./Nav";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
      <Nav />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}
