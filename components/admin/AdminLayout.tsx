/* ============================================================
   ADMIN LAYOUT
   Shared layout for all admin pages: sidebar + content area.
   ============================================================ */

import AdminNav from "../../components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" role="complementary" aria-label="Admin sidebar">
        <AdminNav />
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
