import { useEffect, useRef, useState } from 'react';
import { X, Calendar, MapPin, Users as UsersIcon } from 'lucide-react';
import { createEvent } from '../api/event';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology',
];

const toLocalDateTimeInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function CreateEventModal({ clubId, onClose, onCreated }) {
  const overlayRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: toLocalDateTimeInput(),
    venue: '',
    maxCapacity: '',
    clubId,
  });

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        maxCapacity: Number(form.maxCapacity),
        startTime: new Date(form.startTime).toISOString().replace('Z', ''),
      };
      const res = await createEvent(payload);
      toast.success('Event created!');
      onCreated(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to create event');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="bg-surface-raised border border-surface-border rounded-2xl w-full max-w-[500px] flex flex-col max-h-[90vh] shadow-[var(--shadow-card)] z-50 animate-[scaleIn_0.2s_ease_out]">
        <div className="flex items-center justify-between p-5 border-b border-surface-border shrink-0">
          <span className="font-extrabold text-lg text-text-primary m-0">Create New Event</span>
          <button id="btn-create-close" className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 flex items-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-text-primary" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form id="create-event-form" className="flex flex-col gap-5 p-5 overflow-y-auto" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ce-title" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1 flex items-center gap-1.5">Event Title</label>
            <input
              id="ce-title"
              name="title"
              type="text"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="e.g. Annual Hackathon 2025"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ce-description" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1 flex items-center gap-1.5">Description</label>
            <textarea
              id="ce-description"
              name="description"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted resize-y min-h-[80px]"
              placeholder="Describe the event…"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-5">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="ce-startTime" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1 flex items-center gap-1.5">
                <Calendar size={13} /> Start Date &amp; Time
              </label>
              <input
                id="ce-startTime"
                name="startTime"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="ce-maxCapacity" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1 flex items-center gap-1.5">
                <UsersIcon size={13} /> Max Capacity
              </label>
              <input
                id="ce-maxCapacity"
                name="maxCapacity"
                type="number"
                min="1"
                className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
                placeholder="e.g. 100"
                value={form.maxCapacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ce-venue" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1 flex items-center gap-1.5">
              <MapPin size={13} /> Venue
            </label>
            <input
              id="ce-venue"
              name="venue"
              type="text"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="e.g. Main Auditorium"
              value={form.venue}
              onChange={handleChange}
              required
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-border shrink-0">
          <button
            id="btn-submit-create-event"
            type="submit"
            form="create-event-form"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-primary-600 text-white hover:bg-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-[1px] active:scale-95"
            disabled={busy}
          >
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Event'}
          </button>
          <button id="btn-create-cancel" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
