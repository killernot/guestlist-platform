/* ============================================================
   NAVIGATION COMPONENT
   Top nav with logo, events link, admin login.
   Mobile: hamburger slide-out menu.
   Desktop: horizontal bar (glassmorphism).
   ============================================================ */

import { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="nav-root" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        {/* Logo / Wordmark */}
        <Link href="/" className="nav-logo" aria-label="Guestlist home">
          <span className="nav-logo-text">GUESTLIST</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop">
          <Link href="/events" className="nav-link">
            Events
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
        </button>
      </div>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu" role="menu">
          <Link
            href="/events"
            className="nav-link-mobile"
            role="menuitem"
            onClick={() => setMobileOpen(false)}
          >
            Events
          </Link>
        </div>
      )}
    </nav>
  );
}
