import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, Lock } from "lucide-react";
import { eventsApi, referenceApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import { STATUS_TEXT_CLASS } from "../utils/formatters";
import type { CampusEvent, Department } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function DepartmentVerifyPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [departmentId, setDepartmentId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [formError, setFormError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [revealedUrl, setRevealedUrl] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!eventId) return;
    setLoading(true);
    setPageError(null);
    Promise.all([eventsApi.getById(eventId), referenceApi.getDepartments()])
      .then(([detail, depts]) => {
        setEvent(detail.event);
        setDepartments(depts || []);
        if (detail.event?.department_id) {
          setDepartmentId(String(detail.event.department_id));
        }
      })
      .catch((err) => setPageError(getApiErrorMessage(err, "Unable to load event.")))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (!departmentId || !accessCode.trim()) {
      setFormError("Please select your department and enter the access code.");
      return;
    }

    setVerifying(true);
    setFormError("");
    try {
      const verifyRes = await eventsApi.verifyAccess(eventId, {
        department_id: Number(departmentId),
        access_code: accessCode.trim(),
      });

      const linkRes = await eventsApi.getRegistrationLink(
        eventId,
        verifyRes.access_token
      );
      setRevealedUrl(linkRes.registration_url);
      setAccessCode("");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setFormError(
          "Too many incorrect attempts. Please wait up to 10 minutes before trying again."
        );
      } else {
        setFormError(getApiErrorMessage(err, "Verification failed."));
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading verification..." />;
  if (pageError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <ErrorMessage message={pageError} onRetry={loadData} />
      </div>
    );
  }
  if (!event) return null;

  const isClosed =
    event.status === "Cancelled" ||
    event.status === "Postponed" ||
    event.status === "Completed";

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link
        to={`/events/${eventId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Details
      </Link>

      <div className="surface-card mt-4 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Lock className="h-5 w-5" />
          </div>
          <span className={`text-xs font-semibold ${STATUS_TEXT_CLASS[event.status]}`}>
            {event.status}
          </span>
        </div>

        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Department Access Verification
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Event: <strong>{event.title}</strong>
        </p>

        {isClosed ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            Registration is currently unavailable because this event is {event.status}.
          </div>
        ) : revealedUrl ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <h2 className="mt-2 text-base font-bold text-emerald-900">
              Access Verified
            </h2>
            <p className="mt-1 text-xs text-emerald-800">
              Your temporary access token is valid for 10 minutes. Open the Google Form
              below to complete registration.
            </p>
            <a
              href={revealedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 w-full"
            >
              Open Google Form
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <p className="text-xs leading-relaxed text-slate-500">
              Choose your department and enter the access code shared by your organizer.
              Up to 5 attempts are allowed every 10 minutes.
            </p>

            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
              >
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor="verify-dept"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Department *
              </label>
              <select
                id="verify-dept"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose department</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="verify-code"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Access Code *
              </label>
              <input
                id="verify-code"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="input-field"
                placeholder="Enter department access code (e.g., CSE2026)"
                required
              />
            </div>

            <button type="submit" disabled={verifying} className="btn-primary w-full">
              {verifying ? "Verifying..." : "Verify & Reveal Form Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
