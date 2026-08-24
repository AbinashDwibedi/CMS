import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClubById, getClubEvents } from '../api/club';
import { getMyMembership, joinClub, leaveClub } from '../api/membership';
import { registerForEvent, cancelRegistration, deleteEvent, changeEventStatus } from '../api/event';
import EventModal from '../components/EventModal';
import CreateEventModal from '../components/CreateEventModal';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Loader2, MapPin, Calendar, Users, CheckCircle2,
  ChevronLeft, ChevronRight, Trash2, PenLine, Plus, Mail, Hash,
  Zap, Music2, Trophy, UserPlus, UserMinus, X,
} from 'lucide-react';

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const CATEGORY_ICON = {
  TECHNICAL: <Zap size={20} />,
  CULTURAL:  <Music2 size={20} />,
  SPORTS:    <Trophy size={20} />,
};

const CATEGORY_COLOR = {
  TECHNICAL: 'cat-technical',
  CULTURAL:  'cat-cultural',
  SPORTS:    'cat-sports',
};

function statusMeta(s) {
  if (s === 'UPCOMING')  return { label: 'Upcoming',  cls: 'badge-upcoming' };
  if (s === 'ONGOING')   return { label: 'Ongoing',   cls: 'badge-ongoing' };
  if (s === 'COMPLETED') return { label: 'Completed', cls: 'badge-completed' };
  if (s === 'CANCELLED') return { label: 'Cancelled', cls: 'badge-cancelled' };
  return { label: s, cls: 'badge-default' };
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub]                   = useState(null);
  const [events, setEvents]               = useState([]);
  const [membership, setMembership]       = useState(null);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingClub, setLoadingClub]     = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [joinBusy, setJoinBusy]           = useState(false);

  const [selectedEvent, setSelectedEvent]     = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusBusy, setStatusBusy]           = useState(null);
  const [deleteBusy, setDeleteBusy]           = useState(null);

  const isLeader = membership?.joined && membership?.role === 'LEADER' && membership?.hasEditAccess;

  useEffect(() => {
    Promise.all([
      getClubById(id).then((r) => setClub(r.data.data)),
      getMyMembership(id).then((r) => setMembership(r.data.data)),
    ])
      .catch(() => toast.error('Failed to load club'))
      .finally(() => setLoadingClub(false));
  }, [id]);

  const fetchEvents = useCallback(async (p) => {
    setLoadingEvents(true);
    try {
      const res = await getClubEvents(id, p);
      const pg = res.data.data;
      setEvents(pg.content);
      setTotalPages(pg.totalPages);
      setTotalElements(pg.totalElements);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  }, [id]);

  useEffect(() => { fetchEvents(page); }, [page, fetchEvents]);

  const handleJoin = async () => {
    setJoinBusy(true);
    try {
      await joinClub(id);
      const res = await getMyMembership(id);
      setMembership(res.data.data);
      toast.success('Joined club!');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to join');
    } finally {
      setJoinBusy(false);
    }
  };

  const handleLeave = async () => {
    setJoinBusy(true);
    try {
      await leaveClub(id);
      setMembership({ joined: false });
      toast.success('Left club');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to leave');
    } finally {
      setJoinBusy(false);
    }
  };

  const handleRegistrationChange = (eventId, isNowRegistered) => {
    setEvents((prev) =>
      prev.map((e) => e.id === eventId
        ? { ...e, registered: isNowRegistered, registeredCount: isNowRegistered ? e.registeredCount + 1 : e.registeredCount - 1 }
        : e)
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => ({
        ...prev,
        registered: isNowRegistered,
        registeredCount: isNowRegistered ? prev.registeredCount + 1 : prev.registeredCount - 1,
      }));
    }
  };

  const handleStatusChange = async (eventId, status) => {
    setStatusBusy(eventId);
    try {
      const res = await changeEventStatus(eventId, status);
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: res.data.data.status } : e));
      toast.success(`Status → ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Status update failed');
    } finally {
      setStatusBusy(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeleteBusy(eventId);
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeleteBusy(null);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setShowCreateModal(false);
  };

  if (loadingClub) {
    return (
      <div className="events-loading" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={36} className="spin-icon" />
      </div>
    );
  }

  const colorClass = CATEGORY_COLOR[club?.category] ?? 'cat-technical';

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-transparent self-start -ml-2 text-text-muted hover:text-text-primary mb-1 hover:bg-surface-overlay" onClick={() => navigate('/clubs')}>
        <ArrowLeft size={15} /> Back to Clubs
      </button>

      <div className="bg-[image:var(--gradient-brand)] rounded-[1.25rem] p-8 text-white shadow-[var(--shadow-glow)] flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative overflow-hidden mt-6">
        <div className={`w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl shrink-0 ${colorClass}`}>
          {CATEGORY_ICON[club?.category] ?? <Users size={28} />}
        </div>

        <div className="flex flex-col gap-2 relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className={`inline-flex px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-sm ${colorClass}`}>
              {club?.category?.charAt(0) + club?.category?.slice(1).toLowerCase()}
            </span>
            {membership?.joined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border bg-success-500/20 text-success-200 border-success-500/30">
                <CheckCircle2 size={11} /> Member
              </span>
            )}
            {membership?.role === 'LEADER' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border bg-warning-500/20 text-warning-200 border-warning-500/30">Leader</span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold m-0 tracking-tight leading-tight">{club?.name}</h1>
          <div className="flex items-center gap-4 text-[0.9rem] text-white/90 font-medium flex-wrap">
            <span className="flex items-center gap-1.5"><Hash size={13} />{club?.clubCode}</span>
            <span className="flex items-center gap-1.5"><Mail size={13} />{club?.contactEmail}</span>
          </div>
          {club?.description && (
            <p className="text-[0.95rem] text-white/80 max-w-3xl leading-relaxed mt-2 m-0">{club.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0 self-stretch sm:self-center flex-wrap">
          {isLeader && (
            <button
              id="btn-create-event"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-white text-primary-600 hover:bg-surface-overlay active:scale-95 shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={15} /> Create Event
            </button>
          )}

          {membership?.joined ? (
            <button
              id="btn-leave-club"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-65 bg-transparent border border-white/20 text-white hover:bg-white/10"
              onClick={handleLeave}
              disabled={joinBusy}
            >
              {joinBusy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserMinus size={15} /> Leave</>}
            </button>
          ) : (
            <button
              id="btn-join-club"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-white text-primary-600 hover:bg-surface-overlay active:scale-95 shadow-sm"
              onClick={handleJoin}
              disabled={joinBusy}
            >
              {joinBusy ? <span className="w-4 h-4 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" /> : <><UserPlus size={15} /> Join</>}
            </button>
          )}
        </div>
      </div>

      <div className="w-full min-w-0">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
          <h2 className="font-extrabold text-xl text-text-primary flex items-center gap-3 m-0">
            Events
            {totalElements > 0 && <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[0.75rem] font-bold">{totalElements}</span>}
          </h2>
        </div>

        {loadingEvents ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No events for this club yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
              {events.map((event) => (
                <ClubEventCard
                  key={event.id}
                  event={event}
                  isLeader={isLeader}
                  statusBusy={statusBusy === event.id}
                  deleteBusy={deleteBusy === event.id}
                  onViewMore={() => setSelectedEvent(event)}
                  onStatusChange={(s) => handleStatusChange(event.id, s)}
                  onDelete={() => handleDelete(event.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-5 mt-4">
                <button
                  id="btn-club-prev"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-[0.85rem] text-text-muted font-medium font-mono">Page {page + 1} of {totalPages}</span>
                <button
                  id="btn-club-next"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary"
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

      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegistrationChange={handleRegistrationChange}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          clubId={Number(id)}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleEventCreated}
        />
      )}
    </>
  );
}

function ClubEventCard({ event, isLeader, statusBusy, deleteBusy, onViewMore, onStatusChange, onDelete }) {
  const { label, cls } = statusMeta(event.status);
  const spotsLeft = event.maxCapacity - event.registeredCount;
  const full = spotsLeft <= 0;
  const [statusOpen, setStatusOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setStatusOpen(false);
    }
    if (statusOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  return (
    <div className={`bg-surface-raised border border-surface-border rounded-[1rem] p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-[var(--shadow-glow-sm)] relative ${event.registered ? 'border-primary-500/30 shadow-[var(--shadow-glow-sm)] bg-primary-500/5' : ''}`}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border ${cls}`}>{label}</span>
          {event.registered && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border bg-success-500/10 text-success-500 border-success-500/30">
              <CheckCircle2 size={11} /> Registered
            </span>
          )}
        </div>
        <h2 className="font-bold text-lg text-text-primary m-0 tracking-tight leading-tight">{event.title}</h2>
        <p className="text-xs font-semibold text-primary-400 m-0 uppercase tracking-wider">{event.clubName}</p>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-surface-overlay border border-surface-muted rounded-[0.75rem]">
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary"><Calendar size={13} className="text-text-muted shrink-0" /><span>{fmt(event.startTime)}</span></div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary"><MapPin size={13} className="text-text-muted shrink-0" /><span>{event.venue}</span></div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary">
          <Users size={13} className="text-text-muted shrink-0" />
          <span>
            {event.registeredCount}/{event.maxCapacity}
            {['UPCOMING', 'ONGOING'].includes(event.status) && (
              full
                ? <span className="text-danger-500 font-bold ml-1"> · Full</span>
                : <span className="text-success-500 font-bold ml-1"> · {spotsLeft} left</span>
            )}
          </span>
        </div>
      </div>

      <p className="text-[0.85rem] text-text-muted m-0 line-clamp-3 leading-relaxed flex-1">{event.description}</p>

      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-surface-border">
        <button
          id={`btn-view-event-${event.id}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400"
          style={{ flex: 1 }}
          onClick={onViewMore}
        >
          View Details
        </button>

        {isLeader && (
          <div className="flex items-center bg-surface-overlay rounded-lg border border-surface-muted">
            <div className="relative" ref={dropRef}>
              <button
                id={`btn-status-${event.id}`}
                className="inline-flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer bg-transparent hover:bg-surface-overlay border-none shrink-0 text-text-muted hover:text-text-primary"
                title="Change Status"
                onClick={() => setStatusOpen((v) => !v)}
                disabled={statusBusy}
              >
                {statusBusy
                  ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-primary-400)' }} />
                  : <PenLine size={14} />}
              </button>

              {statusOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-surface-raised border border-surface-border rounded-xl shadow-xl py-1.5 z-[100] flex flex-col gap-1 animate-[fadeUp_0.15s_ease_out]">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-overlay hover:text-text-primary ${event.status === s ? 'text-primary-400 bg-primary-500/5' : ''}`}
                      onClick={() => { onStatusChange(s); setStatusOpen(false); }}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id={`btn-del-event-${event.id}`}
              className="inline-flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer bg-transparent hover:bg-surface-overlay border-none shrink-0 text-text-muted hover:text-danger-500 hover:bg-danger-500/10"
              title="Delete Event"
              onClick={onDelete}
              disabled={deleteBusy}
            >
              {deleteBusy
                ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-danger-400)' }} />
                : <Trash2 size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
