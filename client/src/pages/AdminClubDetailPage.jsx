import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  adminGetClubById, adminGetClubEvents, adminGetClubMembers,
  adminDeleteEvent, adminChangeEventStatus, toggleLeadership,
} from '../api/admin';
import toast from 'react-hot-toast';
import EventModal from '../components/EventModal';
import {
  ArrowLeft, Loader2, Search, ChevronLeft, ChevronRight,
  Calendar, MapPin, Users, CheckCircle2, Trash2, PenLine,
  Crown, UserCheck, Hash, Mail, Zap, Music2, Trophy,
} from 'lucide-react';

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
const CATEGORY_ICON = { TECHNICAL: <Zap size={18} />, CULTURAL: <Music2 size={18} />, SPORTS: <Trophy size={18} /> };
const CATEGORY_COLOR = { TECHNICAL: 'cat-technical', CULTURAL: 'cat-cultural', SPORTS: 'cat-sports' };

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

export default function AdminClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [club, setClub]                   = useState(null);
  const [events, setEvents]               = useState([]);
  const [evtPage, setEvtPage]             = useState(0);
  const [evtTotal, setEvtTotal]           = useState(0);
  const [evtTotalPages, setEvtTotalPages] = useState(0);
  const [members, setMembers]             = useState([]);
  const [membPage, setMembPage]           = useState(0);
  const [membTotal, setMembTotal]         = useState(0);
  const [membTotalPages, setMembTotalPages] = useState(0);
  const [memberSearch, setMemberSearch]   = useState('');
  const [loadingClub, setLoadingClub]     = useState(true);
  const [loadingEvt, setLoadingEvt]       = useState(true);
  const [loadingMemb, setLoadingMemb]     = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusBusy, setStatusBusy]       = useState(null);
  const [deleteBusy, setDeleteBusy]       = useState(null);
  const [toggleBusy, setToggleBusy]       = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    adminGetClubById(id)
      .then((r) => setClub(r.data.data))
      .catch(() => toast.error('Failed to load club'))
      .finally(() => setLoadingClub(false));
  }, [id]);

  const fetchEvents = useCallback(async (p) => {
    setLoadingEvt(true);
    try {
      const r = await adminGetClubEvents(id, p);
      const pg = r.data.data;
      setEvents(pg.content);
      setEvtTotal(pg.totalElements);
      setEvtTotalPages(pg.totalPages);
    } catch { toast.error('Failed to load events'); }
    finally { setLoadingEvt(false); }
  }, [id]);

  const fetchMembers = useCallback(async (p, search) => {
    setLoadingMemb(true);
    try {
      const r = await adminGetClubMembers(id, search, p);
      const pg = r.data.data;
      setMembers(pg.content);
      setMembTotal(pg.totalElements);
      setMembTotalPages(pg.totalPages);
    } catch { toast.error('Failed to load members'); }
    finally { setLoadingMemb(false); }
  }, [id]);

  useEffect(() => { fetchEvents(evtPage); }, [evtPage, fetchEvents]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setMembPage(0);
      fetchMembers(0, memberSearch);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [memberSearch, fetchMembers]);

  useEffect(() => { fetchMembers(membPage, memberSearch); }, [membPage]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    setDeleteBusy(eventId);
    try {
      await adminDeleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    } finally { setDeleteBusy(null); }
  };

  const handleStatusChange = async (eventId, status) => {
    setStatusBusy(eventId);
    try {
      const r = await adminChangeEventStatus(eventId, status);
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: r.data.data.status } : e));
      toast.success(`Status → ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Status update failed');
    } finally { setStatusBusy(null); }
  };

  const handleToggle = async (member) => {
    setToggleBusy(member.userId);
    try {
      await toggleLeadership(id, member.userId);
      setMembers((prev) => prev.map((m) => m.userId === member.userId
        ? { ...m, role: m.role === 'LEADER' ? 'MEMBER' : 'LEADER', hasEditAccess: m.role !== 'LEADER' }
        : m
      ));
      toast.success('Leadership updated');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Toggle failed');
    } finally { setToggleBusy(null); }
  };

  if (loadingClub) {
    return (
      <div className="events-loading" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={36} className="spin-icon" />
      </div>
    );
  }

  const cc = CATEGORY_COLOR[club?.category] ?? 'cat-technical';

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-transparent self-start -ml-2 text-text-muted hover:text-text-primary mb-1 hover:bg-surface-overlay" onClick={() => navigate('/admin/clubs')}>
        <ArrowLeft size={15} /> Back to Clubs
      </button>

      <div className="bg-[image:var(--gradient-brand)] rounded-[1.25rem] p-8 text-white shadow-[var(--shadow-glow)] flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative overflow-hidden mt-6">
        <div className={`w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl shrink-0 ${cc}`}>{CATEGORY_ICON[club?.category] ?? <Users size={28} />}</div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className={`inline-flex px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-sm ${cc}`}>{club?.category?.charAt(0) + club?.category?.slice(1).toLowerCase()}</span>
          </div>
          <h1 className="text-3xl font-extrabold m-0 tracking-tight leading-tight">{club?.name}</h1>
          <div className="flex items-center gap-4 text-[0.9rem] text-white/90 font-medium flex-wrap">
            <span className="flex items-center gap-1.5"><Hash size={13} />{club?.clubCode}</span>
            <span className="flex items-center gap-1.5"><Mail size={13} />{club?.contactEmail}</span>
          </div>
          {club?.description && <p className="text-[0.95rem] text-white/80 max-w-3xl leading-relaxed mt-2 m-0">{club.description}</p>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
            <h2 className="font-extrabold text-xl text-text-primary flex items-center gap-3 m-0">
              Events {evtTotal > 0 && <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[0.75rem] font-bold">{evtTotal}</span>}
            </h2>
          </div>

          {loadingEvt ? (
            <div className="flex flex-col items-center justify-center gap-4 text-text-muted" style={{ padding: '2rem 0' }}><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : events.length === 0 ? (
            <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No events for this club.</div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
                {events.map((event) => (
                  <AdminEventCard
                    key={event.id}
                    event={event}
                    statusBusy={statusBusy === event.id}
                    deleteBusy={deleteBusy === event.id}
                    onView={() => setSelectedEvent(event)}
                    onStatusChange={(s) => handleStatusChange(event.id, s)}
                    onDelete={() => handleDeleteEvent(event.id)}
                  />
                ))}
              </div>
              {evtTotalPages > 1 && (
                <div className="flex justify-center items-center gap-5 mt-4">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" disabled={evtPage === 0} onClick={() => setEvtPage((p) => p - 1)}>
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <span className="text-[0.85rem] text-text-muted font-medium font-mono">Page {evtPage + 1} of {evtTotalPages}</span>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" disabled={evtPage >= evtTotalPages - 1} onClick={() => setEvtPage((p) => p + 1)}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-full lg:w-[380px] shrink-0 bg-surface-raised border border-surface-border rounded-2xl p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
            <h2 className="font-extrabold text-xl text-text-primary flex items-center gap-3 m-0">
              Members {membTotal > 0 && <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 text-[0.75rem] font-bold">{membTotal}</span>}
            </h2>
          </div>
          <div className="relative flex items-center" style={{ marginBottom: '1rem', maxWidth: '100%' }}>
            <Search size={14} className="absolute left-4 text-text-muted" />
            <input
              id="member-search"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-overlay border border-surface-muted rounded-xl text-[0.95rem] text-text-primary transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] placeholder:text-text-muted"
              placeholder="Search by name, email, roll…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>

          {loadingMemb ? (
            <div className="flex flex-col items-center justify-center gap-4 text-text-muted" style={{ padding: '2rem 0' }}><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : members.length === 0 ? (
            <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No members found.</div>
          ) : (
            <>
              <div className="flex flex-col gap-0">
                {members.map((m) => (
                  <MemberRow key={m.userId} member={m} busy={toggleBusy === m.userId} onToggle={() => handleToggle(m)} />
                ))}
              </div>
              {membTotalPages > 1 && (
                <div className="flex justify-center items-center gap-5 mt-4" style={{ marginTop: '1rem' }}>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" style={{ minWidth: 'auto', fontSize: '0.8rem' }} disabled={membPage === 0} onClick={() => setMembPage((p) => p - 1)}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="text-[0.85rem] text-text-muted font-medium font-mono">{membPage + 1}/{membTotalPages}</span>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" style={{ minWidth: 'auto', fontSize: '0.8rem' }} disabled={membPage >= membTotalPages - 1} onClick={() => setMembPage((p) => p + 1)}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onRegistrationChange={() => {}} />
      )}
    </>
  );
}

function AdminEventCard({ event, statusBusy, deleteBusy, onView, onStatusChange, onDelete }) {
  const { label, cls } = statusMeta(event.status);
  const [statusOpen, setStatusOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setStatusOpen(false); }
    if (statusOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [statusOpen]);

  return (
    <div className="bg-surface-raised border border-surface-border rounded-[1rem] p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-[var(--shadow-glow-sm)] relative">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border ${cls}`}>{label}</span>
        </div>
        <h2 className="font-bold text-lg text-text-primary m-0 tracking-tight leading-tight">{event.title}</h2>
        <p className="text-xs font-semibold text-primary-400 m-0 uppercase tracking-wider">{event.clubName}</p>
      </div>
      <div className="flex flex-col gap-2 p-3 bg-surface-overlay border border-surface-muted rounded-[0.75rem]">
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary"><Calendar size={13} className="text-text-muted shrink-0" /><span>{fmt(event.startTime)}</span></div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary"><MapPin size={13} className="text-text-muted shrink-0" /><span>{event.venue}</span></div>
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary"><Users size={13} className="text-text-muted shrink-0" /><span>{event.registeredCount}/{event.maxCapacity}</span></div>
      </div>
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-surface-border">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400" style={{ flex: 1 }} onClick={onView}>View Details</button>
        <div className="flex items-center bg-surface-overlay rounded-lg border border-surface-muted">
          <div className="relative" ref={dropRef}>
            <button className="inline-flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer bg-transparent hover:bg-surface-overlay border-none shrink-0 text-text-muted hover:text-text-primary" title="Change Status" onClick={() => setStatusOpen((v) => !v)} disabled={statusBusy}>
              {statusBusy ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-primary-400)' }} /> : <PenLine size={14} />}
            </button>
            {statusOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-surface-raised border border-surface-border rounded-xl shadow-xl py-1.5 z-[100] flex flex-col gap-1 animate-[fadeUp_0.15s_ease_out]">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} className={`w-full text-left px-4 py-2 text-sm font-semibold text-text-secondary bg-transparent border-none cursor-pointer transition-colors hover:bg-surface-overlay hover:text-text-primary ${event.status === s ? 'text-primary-400 bg-primary-500/5' : ''}`} onClick={() => { onStatusChange(s); setStatusOpen(false); }}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="inline-flex items-center justify-center p-2 transition-colors duration-200 cursor-pointer bg-transparent hover:bg-surface-overlay border-none shrink-0 text-text-muted hover:text-danger-500 hover:bg-danger-500/10" title="Delete" onClick={onDelete} disabled={deleteBusy}>
            {deleteBusy ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-danger-400)' }} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member, busy, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 hover:bg-surface-overlay border border-transparent hover:border-surface-border">
      <div className="w-10 h-10 rounded-[0.6rem] bg-surface-overlay text-text-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-surface-muted">{(member.studentName ?? member.name)?.slice(0, 2).toUpperCase()}</div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-bold text-[0.9rem] text-text-primary truncate">{member.studentName ?? '—'}</span>
        <span className="text-[0.75rem] font-semibold text-text-muted truncate">@{member.name} · {member.rollNumber}</span>
        <span className="text-[0.75rem] text-text-muted truncate">{member.department}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {member.role === 'LEADER' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider bg-warning-500/10 text-warning-500 border border-warning-500/20 shadow-[0_0_10px_rgba(234,179,8,0.15)]"><Crown size={10} /> Leader</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider bg-surface-muted text-text-muted border border-surface-border">Member</span>
        )}
        <button
          id={`btn-toggle-${member.userId}`}
          className="inline-flex items-center justify-center p-2 rounded-[0.625rem] transition-colors duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary shrink-0"
          title={member.role === 'LEADER' ? 'Remove leadership' : 'Make leader'}
          onClick={onToggle}
          disabled={busy}
        >
          {busy
            ? <span className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
            : member.role === 'LEADER' ? <UserCheck size={14} /> : <Crown size={14} />}
        </button>
      </div>
    </div>
  );
}
