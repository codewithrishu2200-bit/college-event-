import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { authApi } from "../api/services";
import { useAuth } from "../hooks/useAuth";
import GoogleSignInButton from "../components/GoogleSignInButton";
import LoadingSpinner from "../components/LoadingSpinner";

const PRESET_ACCOUNTS = [
  {
    label: "Sign in as Student (Attendee)",
    email: "student@college.edu",
    name: "Rohan Verma",
    detail: "Browse events, search, unlock department access codes",
  },
  {
    label: "Sign in as Event Organizer",
    email: "organizer.cse@college.edu",
    name: "Priya Sharma",
    detail: "Create/edit own events, set access codes, post announcements",
  },
  {
    label: "Sign in as Campus Admin",
    email: "admin@college.edu",
    name: "Dr. Ananya Nair",
    detail: "Manage user roles, all events, departments & categories",
  },
];

export default function LoginPage() {
  const { loginWithGoogle, loginWithDemo } = useAuth();
  const [config, setConfig] = useState<{
    googleClientId: string | null;
    googleConfigured: boolean;
    demoModeEnabled: boolean;
    allowedDomain: string | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    "/events";

  useEffect(() => {
    authApi
      .getConfig()
      .then((c) => setConfig(c))
      .catch(() =>
        setConfig({
          googleClientId: null,
          googleConfigured: false,
          demoModeEnabled: true,
          allowedDomain: null,
        })
      );
  }, []);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setSubmitting(true);
      try {
        await loginWithGoogle(credential);
        navigate(redirectTo, { replace: true });
      } catch {
        // Error toast handled by AuthContext
      } finally {
        setSubmitting(false);
      }
    },
    [loginWithGoogle, navigate, redirectTo]
  );

  const handleDemoLogin = async (email: string, name?: string) => {
    setSubmitting(true);
    try {
      await loginWithDemo(email, name);
      navigate(redirectTo, { replace: true });
    } catch {
      // Error toast handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    await handleDemoLogin(customEmail.trim(), customName.trim() || undefined);
  };

  if (!config) {
    return <LoadingSpinner fullScreen label="Loading sign-in options..." />;
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="surface-card w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Sign in to CampusPulse</h1>
            <p className="text-xs text-slate-500">
              New accounts default to Attendee role on the server
            </p>
          </div>
        </div>

        {config.allowedDomain && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Sign-in is restricted to <strong>@{config.allowedDomain}</strong> accounts.
          </p>
        )}

        <div className="mt-6">
          {submitting ? (
            <LoadingSpinner label="Verifying credentials..." />
          ) : config.googleConfigured && config.googleClientId ? (
            <div className="space-y-3 text-center">
              <GoogleSignInButton
                clientId={config.googleClientId}
                onCredential={handleGoogleCredential}
              />
              <p className="text-xs text-slate-400">
                Google ID tokens are verified server-side before issuing your session.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-700">
                  Campus Accounts (Live Server JWT Session)
                </p>
                {PRESET_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    onClick={() => handleDemoLogin(acct.email, acct.name)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-600 hover:bg-blue-50/40"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {acct.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">{acct.detail}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="text-xs font-semibold text-slate-700">
                  Or sign in with a new campus email (creates Attendee)
                </p>
                <form onSubmit={handleCustomSubmit} className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="demo-name" className="sr-only">
                      Full Name
                    </label>
                    <input
                      id="demo-name"
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Full Name (optional)"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-email" className="sr-only">
                      Campus Email
                    </label>
                    <input
                      id="demo-email"
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="student.name@college.edu"
                      className="input-field"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Continue as Attendee
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
