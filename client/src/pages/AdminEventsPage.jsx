import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetEvents, adminDeleteEvent } from '../api/admin';
import EventModal from '../components/EventModal';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Search, Loader2, Trash2, Download,
  Calendar, MapPin, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { adminGetEventRegistrations } from '../api/admin';

function statusMeta(s) {
  if (s === 'UPCOMING')  return { label: 'Upcoming',  cls: 'bg-info-500/10 text-info-400 border-info-500/20' };
  if (s === 'ONGOING')   return { label: 'Ongoing',   cls: 'bg-success-500/10 text-success-400 border-success-500/20 animate-pulse' };
  if (s === 'COMPLETED') return { label: 'Completed', cls: 'bg-surface-muted text-text-muted border-surface-border' };
  if (s === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-danger-500/10 text-danger-400 border-danger-500/20' };
  return { label: s, cls: 'bg-surface-muted text-text-muted border-surface-border' };
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents]           = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteBusy, setDeleteBusy]   = useState(null);
  const timer = useRef(null);

  const fetchEvents = useCallback(async (p, q) => {
    setLoading(true);
    try {
      const r = await adminGetEvents(q, p);
      const pg = r.data.data;
      setEvents(pg.content);
      setTotalPages(pg.totalPages);
      setTotalElements(pg.totalElements);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPage(0);
      fetchEvents(0, search);
    }, 350);
    return () => clearTimeout(timer.current);
  }, [search, fetchEvents]);

  useEffect(() => { fetchEvents(page, search); }, [page]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    setDeleteBusy(eventId);
    try {
      await adminDeleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeleteBusy(null);
    }
  };

  const handleDownloadExcel = async (event) => {
    try {
      const toastId = toast.loading('Generating Excel file...');
      const res = await adminGetEventRegistrations(event.id);
      const registrations = res.data.data;

      if (registrations.length === 0) {
        toast.dismiss(toastId);
        toast.error('No registrations found for this event');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registrations');

      worksheet.columns = [
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Roll Number', key: 'studentRollNumber', width: 15 },
        { header: 'Email', key: 'studentEmail', width: 30 },
        { header: 'Department', key: 'studentDepartment', width: 25 },
        { header: 'Registered At', key: 'registeredAt', width: 25 },
      ];

      registrations.forEach((reg) => {
        worksheet.addRow({
          studentName: reg.studentName,
          studentRollNumber: reg.studentRollNumber,
          studentEmail: reg.studentEmail,
          studentDepartment: reg.studentDepartment,
          registeredAt: new Date(reg.registeredAt).toLocaleString('en-IN'),
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title}_registrations.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(toastId);
      toast.success('Excel downloaded successfully');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download excel');
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex flex-col gap-3 mb-6">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-65 bg-transparent border border-transparent self-start -ml-2 text-text-muted hover:text-text-primary mb-1 hover:bg-surface-overlay" onClick={() => navigate('/admin/home')}>
          <ArrowLeft size={15} /> Dashboard
        </button>
        <div>
          <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Manage Events</h1>
          <p className="text-sm text-text-muted mt-1 m-0 font-medium">{totalElements} events total</p>
        </div>
      </div>

      <div className="relative flex items-center mb-6" style={{ maxWidth: '400px' }}>
        <Search size={15} className="absolute left-4 text-text-muted" />
        <input
          id="events-search"
          className="w-full pl-10 pr-4 py-2.5 bg-surface-overlay border border-surface-muted rounded-xl text-[0.95rem] text-text-primary transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] placeholder:text-text-muted"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted"><Loader2 size={36} className="animate-spin text-primary-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No events found.</div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
            {events.map((event) => (
              <AdminEventListCard
                key={event.id}
                event={event}
                deleteBusy={deleteBusy === event.id}
                onView={() => setSelectedEvent(event)}
                onDelete={() => handleDelete(event.id)}
                onDownload={() => handleDownloadExcel(event)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-5 mt-4">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-[0.85rem] text-text-muted font-medium font-mono">Page {page + 1} of {totalPages}</span>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 bg-transparent text-text-muted hover:bg-surface-overlay hover:text-text-primary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onRegistrationChange={() => {}} />
      )}
    </>
  );
}

function AdminEventListCard({ event, deleteBusy, onView, onDelete, onDownload }) {
  const { label, cls } = statusMeta(event.status);

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
        <div className="flex items-center gap-2.5 text-[0.82rem] text-text-secondary">
          <Users size={13} className="text-text-muted shrink-0" />
          <span>{event.registeredCount}/{event.maxCapacity}</span>
        </div>
      </div>
      <p className="text-[0.85rem] text-text-muted m-0 line-clamp-3 leading-relaxed flex-1">{event.description}</p>
      <div className="flex items-center gap-2 mt-3 pt-4 border-t border-surface-border">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400" style={{ flex: 1 }} onClick={onView}>View Details</button>
        <button
          className="inline-flex items-center justify-center p-2 rounded-[0.625rem] transition-colors duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary shrink-0"
          title="Download Registrations"
          onClick={onDownload}
        >
          <Download size={14} />
        </button>
        <button
          className="inline-flex items-center justify-center p-2 rounded-[0.625rem] transition-colors duration-200 cursor-pointer bg-transparent border border-transparent text-text-muted shrink-0 hover:text-danger-500 hover:bg-danger-500/10"
          title="Delete Event"
          onClick={onDelete}
          disabled={deleteBusy}
        >
          {deleteBusy
            ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-danger-400)' }} />
            : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}
