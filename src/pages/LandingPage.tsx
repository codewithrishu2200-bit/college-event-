import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { eventsApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { formatEventDate, STATUS_TEXT_CLASS } from "../utils/formatters";
import { HERO_CAMPUS_IMAGE } from "../utils/posterAssets";
import type { CampusEvent } from "../types";
import EventPoster from "../components/EventPoster";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = () => {
    setLoading(true);
    setError(null);
    eventsApi
      .getPreview()
      .then((list) => setEvents(list))
      .catch((err) => setError(getApiErrorMessage(err, "Unable to load events.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPreview();
  }, []);

  return (
    <div>
      {/* Hero Split */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-stretch gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16 lg:px-8">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-blue-700">
              Official Campus Event Directory
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl">
              Discover approved college events and reach registration directly.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
              One central portal for college-wide symposia, cultural nights, and
              department workshops—complete with live status notices and guarded
              Google Forms links.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link to="/events" className="btn-primary px-5 py-2.5">
                  Browse Event Directory
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link to="/login" className="btn-primary px-5 py-2.5">
                  Sign in to Explore Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-64 overflow-hidden rounded-xl border border-slate-200 sm:h-80 lg:h-full lg:min-h-[340px]">
              <img
                src={HERO_CAMPUS_IMAGE}
                alt="University engineering auditorium atrium during a campus symposium"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial 3-Step Workflow */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              01. Filter Across Campus
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Search upcoming, ongoing, and postponed events by category, scope,
              department, or date range without hunting across scattered chat groups.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              02. Server-Verified Access
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Department-specific events stay locked behind hashed access codes
              verified on the server—registration URLs never appear in page data.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              03. Direct Google Forms
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Once verified, open the official Google Form directly. Form responses
              remain cleanly in your organizer's Google Sheets.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming College-Wide Events Preview */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Upcoming College-Wide Events
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Sign in to view full details, department-specific workshops, and official
              registration links.
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              View full directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-6">
          {loading && <LoadingSpinner label="Loading upcoming events..." />}
          {!loading && error && <ErrorMessage message={error} onRetry={loadPreview} />}
          {!loading && !error && events.length === 0 && (
            <EmptyState
              title="No upcoming college-wide events yet"
              description="Approved events will appear here as soon as organizers publish them."
            />
          )}
          {!loading && !error && events.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <article
                  key={ev.event_id}
                  className="surface-card flex flex-col overflow-hidden"
                >
                  <EventPoster posterUrl={ev.poster_url} title={ev.title} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className={`font-semibold ${STATUS_TEXT_CLASS[ev.status]}`}>
                        {ev.status}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ev.event_type}</span>
                      {ev.category_name && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{ev.category_name}</span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">{ev.title}</h3>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {formatEventDate(ev.event_date)} · {ev.start_time}–{ev.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ev.venue}</span>
                      </div>
                    </div>

                    <Link
                      to={isAuthenticated ? `/events/${ev.event_id}` : "/login"}
                      className="btn-secondary mt-5 w-full"
                    >
                      {isAuthenticated ? "View Event Details" : "Sign in to View"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
