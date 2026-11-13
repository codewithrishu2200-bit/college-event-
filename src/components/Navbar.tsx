import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? "border-blue-700 text-slate-900"
        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2.5 text-sm font-medium ${
      isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
    }`;

  const handleLogout = () => {
    logout("You have been signed out.");
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          CampusPulse
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/events" className={navLinkClass}>
                Events
              </NavLink>
              <NavLink to="/announcements" className={navLinkClass}>
                Announcements
              </NavLink>
            </>
          )}
          {(role === "Organizer" || role === "Admin") && (
            <NavLink to="/organizer" className={navLinkClass}>
              Organizer Studio
            </NavLink>
          )}
          {role === "Admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Zone 3: Account Action */}
        <div className="hidden items-center gap-4 shrink-0 md:flex">
          {isAuthenticated && user ? (
            <>
              <span className="max-w-[200px] truncate text-xs text-slate-500">
                {user.name} · <strong className="font-semibold text-slate-700">{role}</strong>
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-1.5">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              className={mobileLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/events"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Events
                </NavLink>
                <NavLink
                  to="/announcements"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Announcements
                </NavLink>
              </>
            )}
            {(role === "Organizer" || role === "Admin") && (
              <NavLink
                to="/organizer"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Organizer Studio
              </NavLink>
            )}
            {role === "Admin" && (
              <NavLink
                to="/admin"
                className={mobileLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </NavLink>
            )}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
                <button type="button" onClick={handleLogout} className="btn-secondary">
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary w-full"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
