import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../api/event';
import EventModal from '../components/EventModal';
import toast from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

function statusMeta(status) {
  if (status === 'UPCOMING')  return { label: 'Upcoming',  cls: 'bg-info-500/10 text-info-400 border-info-500/20' };
  if (status === 'ONGOING')   return { label: 'Ongoing',   cls: 'bg-success-500/10 text-success-400 border-success-500/20 animate-pulse' };
  if (status === 'COMPLETED') return { label: 'Completed', cls: 'bg-surface-muted text-text-muted border-surface-border' };
  if (status === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-danger-500/10 text-danger-400 border-danger-500/20' };
  return { label: status, cls: 'bg-surface-muted text-text-muted border-surface-border' };
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function HomePage() {
  const { user } = useAuth();

  const [events, setEvents]           = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await getEvents(p);
      const pageData = res.data.data;
      setEvents(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(page);
  }, [page, fetchEvents]);

  const handleRegistrationChange = (eventId, isNowRegistered) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registered: isNowRegistered,
              registeredCount: isNowRegistered
                ? e.registeredCount + 1
                : e.registeredCount - 1,
            }
          : e
      )
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => ({
        ...prev,
        registered: isNowRegistered,
        registeredCount: isNowRegistered
          ? prev.registeredCount + 1
          : prev.registeredCount - 1,
      }));
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Campus Events</h1>
            <p className="text-sm text-text-muted mt-1 m-0 font-medium">
              Welcome back, <strong className="text-text-primary">{user?.name}</strong> — {totalElements} active event{totalElements !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
            <Loader2 size={36} className="animate-spin text-primary-500" />
            <span>Loading events…</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">
            <p>No upcoming or ongoing events right now. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewMore={() => setSelectedEvent(event)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-5 mt-4">
                <button
                  id="btn-prev-page"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-[0.85rem] text-text-muted font-medium font-mono">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  id="btn-next-page"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegistrationChange={handleRegistrationChange}
        />
      )}
    </>
  );
}

function EventCard({ event, onViewMore }) {
  const { label, cls } = statusMeta(event.status);
  const spotsLeft = event.maxCapacity - event.registeredCount;
  const full = spotsLeft <= 0;

  return (
    <div className={`bg-surface-raised border border-surface-border rounded-[1rem] p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-[var(--shadow-glow-sm)] relative ${event.registered ? 'border-primary-500/40 shadow-[0_0_12px_rgba(139,92,246,0.08)]' : ''}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border ${cls}`}>
            {label}
          </span>
          {event.registered && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border bg-primary-500/10 text-primary-400 border-primary-500/30">
              <CheckCircle2 size={11} /> Registered
            </span>
          )}
        </div>
        <h2 className="font-bold text-lg text-text-primary m-0 tracking-tight leading-tight">{event.title}</h2>
        <p className="text-xs font-semibold text-primary-400 m-0 uppercase tracking-wider">{event.clubName}</p>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-surface-overlay border border-surface-muted rounded-[0.75rem]">
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary">
          <Calendar size={13} className="text-text-muted shrink-0" />
          <span>{fmt(event.startTime)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary">
          <MapPin size={13} className="text-text-muted shrink-0" />
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary">
          <Users size={13} className="text-text-muted shrink-0" />
          <span>
            {event.registeredCount}/{event.maxCapacity}
            {['UPCOMING', 'ONGOING'].includes(event.status) && (
              full
                ? <span className="text-danger-400 font-semibold"> · Full</span>
                : <span className="text-success-400 font-semibold"> · {spotsLeft} left</span>
            )}
          </span>
        </div>
      </div>

      <p className="text-[0.85rem] text-text-muted m-0 line-clamp-3 leading-relaxed flex-1">{event.description}</p>

      <button
        id={`btn-view-event-${event.id}`}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-65 border border-surface-muted bg-transparent text-text-primary hover:border-primary-500 hover:text-primary-400"
        onClick={onViewMore}
      >
        View Details
      </button>
    </div>
  );
}
