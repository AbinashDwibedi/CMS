import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllClubs, adminDeleteClub, adminCreateClub, adminUpdateClub } from '../api/admin';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2,
  Zap, Music2, Trophy, Users, X, ExternalLink,
} from 'lucide-react';

const CATEGORIES = ['TECHNICAL', 'CULTURAL', 'SPORTS'];
const CATEGORY_ICON = { TECHNICAL: <Zap size={16} />, CULTURAL: <Music2 size={16} />, SPORTS: <Trophy size={16} /> };
const CATEGORY_COLOR = { TECHNICAL: 'cat-technical', CULTURAL: 'cat-cultural', SPORTS: 'cat-sports' };

const EMPTY_FORM = { clubCode: '', name: '', category: 'TECHNICAL', description: '', contactEmail: '' };

export default function AdminClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [busy, setBusy]       = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(null);

  useEffect(() => {
    adminGetAllClubs()
      .then((r) => setClubs(r.data.data))
      .catch(() => toast.error('Failed to load clubs'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (club) => {
    setForm({
      clubCode: club.clubCode,
      name: club.name,
      category: club.category,
      description: club.description ?? '',
      contactEmail: club.contactEmail,
      _id: club.id,
    });
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (modal === 'create') {
        await adminCreateClub(form);
        toast.success('Club created!');
        const res = await adminGetAllClubs();
        setClubs(res.data.data);
      } else {
        await adminUpdateClub(form._id, form);
        toast.success('Club updated!');
        setClubs((prev) => prev.map((c) =>
          c.id === form._id
            ? { ...c, clubCode: form.clubCode, name: form.name, category: form.category, description: form.description, contactEmail: form.contactEmail }
            : c
        ));
      }
      setModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this club? All associated events and memberships will also be deleted.')) return;
    setDeleteBusy(id);
    try {
      await adminDeleteClub(id);
      setClubs((prev) => prev.filter((c) => c.id !== id));
      toast.success('Club deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeleteBusy(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex flex-col gap-3 mb-6">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-transparent self-start -ml-2 text-text-muted hover:text-text-primary mb-1 hover:bg-surface-overlay" onClick={() => navigate('/admin/home')}>
          <ArrowLeft size={15} /> Dashboard
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Manage Clubs</h1>
            <p className="text-sm text-text-muted mt-1 m-0 font-medium">{clubs.length} clubs registered</p>
          </div>
          <button id="btn-create-club" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-primary-600 text-white hover:bg-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-[1px] active:scale-95" onClick={openCreate}>
            <Plus size={15} /> New Club
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted"><Loader2 size={36} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
          {clubs.map((club) => (
            <AdminClubCard
              key={club.id}
              club={club}
              deleteBusy={deleteBusy === club.id}
              onEdit={() => openEdit(club)}
              onDelete={() => handleDelete(club.id)}
              onView={() => navigate(`/admin/clubs/${club.id}`)}
            />
          ))}
        </div>
      )}

      </div>

      {modal && (
        <ClubFormModal
          mode={modal}
          form={form}
          setForm={setForm}
          busy={busy}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function AdminClubCard({ club, deleteBusy, onEdit, onDelete, onView }) {
  const cc = CATEGORY_COLOR[club.category] ?? 'bg-info-500/10 text-info-400 border-info-500/20';
  const ccBadge = club.category === 'TECHNICAL' ? 'bg-info-500/10 text-info-400 border-info-500/20' : club.category === 'CULTURAL' ? 'bg-success-500/10 text-success-400 border-success-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20';

  return (
    <div className="bg-surface-raised border border-surface-border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-lg">
      <div className={`w-12 h-12 rounded-[0.85rem] flex items-center justify-center border text-current mb-1 ${ccBadge}`}>
        {CATEGORY_ICON[club.category] ?? <Users size={20} />}
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <span className={`inline-flex self-start px-2 py-0.5 rounded-[0.35rem] font-bold text-[0.62rem] uppercase tracking-wider border mb-0.5 ${ccBadge}`}>
          {club.category?.charAt(0) + club.category?.slice(1).toLowerCase()}
        </span>
        <h2 className="font-bold text-[1.1rem] text-text-primary m-0 tracking-tight leading-tight">{club.name}</h2>
        <p className="flex items-center gap-2 text-[0.8rem] text-text-muted m-0">
          <span className="font-mono font-semibold text-text-secondary uppercase">{club.clubCode}</span>
          <span className="opacity-50">·</span>
          <span className="truncate">{club.contactEmail}</span>
        </p>
        {club.description && (
          <p className="text-[0.85rem] text-text-secondary m-0 line-clamp-2 leading-relaxed mt-1 flex-1">{club.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-surface-border">
        <button id={`btn-view-club-${club.id}`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400" style={{ flex: 1 }} onClick={onView}>
          <ExternalLink size={13} /> View Club
        </button>
        <button id={`btn-edit-club-${club.id}`} className="inline-flex items-center justify-center p-2 rounded-[0.625rem] transition-colors duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary shrink-0" title="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </button>
        <button
          id={`btn-del-club-${club.id}`}
          className="inline-flex items-center justify-center p-2 rounded-[0.625rem] transition-colors duration-200 cursor-pointer bg-transparent border border-transparent text-text-muted shrink-0 hover:text-danger-500 hover:bg-danger-500/10"
          title="Delete"
          onClick={onDelete}
          disabled={deleteBusy}
        >
          {deleteBusy ? <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent" style={{ borderTopColor: 'var(--color-danger-400)' }} /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}

function ClubFormModal({ mode, form, setForm, busy, onSubmit, onClose }) {
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-raised border border-surface-border rounded-2xl w-full max-w-[500px] flex flex-col max-h-[90vh] shadow-[var(--shadow-card)] z-50 animate-[scaleIn_0.2s_ease_out]">
        <div className="flex items-center justify-between p-5 border-b border-surface-border shrink-0">
          <span className="font-extrabold text-lg text-text-primary m-0">{mode === 'create' ? 'Create Club' : 'Edit Club'}</span>
          <button className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 flex items-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-text-primary" onClick={onClose}><X size={20} /></button>
        </div>
        <form id="club-form" className="flex flex-col gap-5 p-5 overflow-y-auto" onSubmit={onSubmit} noValidate>
          <div className="flex gap-5">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1" htmlFor="cf-code">Club Code</label>
              <input id="cf-code" name="clubCode" className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted" value={form.clubCode} onChange={change} required placeholder="e.g. TECHS" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1" htmlFor="cf-cat">Category</label>
              <select id="cf-cat" name="category" className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]" value={form.category} onChange={change}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1" htmlFor="cf-name">Club Name</label>
            <input id="cf-name" name="name" className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted" value={form.name} onChange={change} required placeholder="Full club name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1" htmlFor="cf-email">Contact Email</label>
            <input id="cf-email" name="contactEmail" type="email" className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted" value={form.contactEmail} onChange={change} required placeholder="club@university.edu" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1" htmlFor="cf-desc">Description</label>
            <textarea id="cf-desc" name="description" className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted resize-y min-h-[80px]" value={form.description} onChange={change} rows={3} required placeholder="What is this club about?" />
          </div>
        </form>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-border shrink-0">
          <button type="submit" form="club-form" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-primary-600 text-white hover:bg-primary-500" disabled={busy}>
            {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary" onClick={onClose} disabled={busy}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
