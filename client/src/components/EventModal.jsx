import { useEffect, useRef, useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Building2,
  Tag,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { registerForEvent, cancelRegistration } from '../api/event';
import toast from 'react-hot-toast';

function statusMeta(status) {
  if (status === 'UPCOMING') return { label: 'Upcoming', cls: 'badge-upcoming' };
  if (status === 'ONGOING')  return { label: 'Ongoing',  cls: 'badge-ongoing' };
  return { label: status, cls: 'badge-default' };
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EventModal({ event, onClose, onRegistrationChange }) {
  const overlayRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [localRegistered, setLocalRegistered] = useState(event.registered);

  useEffect(() => {
    setLocalRegistered(event.registered);
  }, [event.registered]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
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

  const spotsLeft = event.maxCapacity - event.registeredCount;
  const full = spotsLeft <= 0;
  const { label, cls } = statusMeta(event.status);

  const handleRegister = async () => {
    setBusy(true);
    try {
      await registerForEvent(event.id);
      setLocalRegistered(true);
      onRegistrationChange(event.id, true);
      toast.success('Registered successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelRegistration(event.id);
      setLocalRegistered(false);
      onRegistrationChange(event.id, false);
      toast.success('Registration cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Cancellation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="bg-surface-raised border border-surface-border rounded-2xl w-full max-w-[600px] flex flex-col max-h-[90vh] shadow-[var(--shadow-card)] z-50 animate-[scaleIn_0.2s_ease_out]">
        <div className="flex items-center justify-between p-5 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border ${cls}`}>{label}</span>
            {localRegistered && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider border bg-success-500/10 text-success-500 border-success-500/30">
                <CheckCircle2 size={12} /> Registered
              </span>
            )}
          </div>
          <button id="btn-modal-close" className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 flex items-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-text-primary" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          <h2 className="text-[1.35rem] font-extrabold text-text-primary m-0 leading-[1.3]">{event.title}</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4 bg-surface-overlay border border-surface-muted rounded-xl">
            <div className="flex items-start gap-3">
              <Calendar size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Date &amp; Time</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">{fmt(event.startTime)}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Venue</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">{event.venue}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Organised by</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">{event.clubName}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Capacity</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">
                  {event.registeredCount} / {event.maxCapacity} registered
                  {full
                    ? <span className="text-danger-500 font-bold ml-1"> · Full</span>
                    : <span className="text-success-500 font-bold ml-1"> · {spotsLeft} spots left</span>}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Tag size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Event ID</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">#{event.id}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="block text-[0.7rem] font-bold text-text-muted uppercase tracking-wider mb-0.5">Status</span>
                <span className="block text-[0.9rem] font-medium text-text-primary">{label}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-[1.05rem] text-text-primary m-0">About this Event</h3>
            <p className="text-[0.95rem] text-text-secondary leading-relaxed m-0 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-border shrink-0">
          {['UPCOMING', 'ONGOING'].includes(event.status) ? (
            localRegistered ? (
              event.status === 'UPCOMING' ? (
                <button
                  id="btn-cancel-registration"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-danger-500/10 text-danger-500 hover:bg-danger-500/20 active:scale-95"
                  onClick={handleCancel}
                  disabled={busy}
                >
                  {busy ? <span className="w-4 h-4 border-2 border-danger-500/30 border-t-danger-500 rounded-full animate-spin" /> : 'Cancel Registration'}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-[0.9rem] font-semibold text-success-500 mr-auto">
                  <CheckCircle2 size={16} />
                  You are registered for this event
                </span>
              )
            ) : (
              <button
                id="btn-register-event"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-primary-600 text-white hover:bg-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-[1px] active:scale-95"
                onClick={handleRegister}
                disabled={busy || full}
              >
                {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : full ? 'Event Full' : 'Register Now'}
              </button>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-[0.9rem] font-semibold mr-auto text-text-muted">
              Registrations are closed for this event
            </span>
          )}
          <button id="btn-modal-dismiss" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
