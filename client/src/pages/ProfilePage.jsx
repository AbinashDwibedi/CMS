import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../api/student';
import { deleteUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Mail, BookOpen, Hash, Calendar, Shield,
  Pencil, Trash2, X, Check, Loader2, AlertTriangle,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState({ name: '', email: '', department: '' });
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    setEditForm({ name: profile.name, email: profile.email, department: profile.department });
    setEditing(true);
  };

  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMyProfile(editForm);
      setProfile(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser();
      logout();
      toast.success('Account deleted');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const initials = profile?.name?.slice(0, 2).toUpperCase() ?? '??';
  const roleLabel = user?.role?.replace('ROLE_', '') ?? 'Student';

  return (
    <div className="w-full max-w-5xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        <div className="flex-1 w-full bg-surface-raised border border-surface-border rounded-2xl p-6 shadow-[var(--shadow-card)] flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-[2rem] font-bold text-white shadow-[var(--shadow-glow-sm)]">{initials}</div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-extrabold m-0 text-text-primary tracking-tight">{profile?.name}</h1>
              <span className="inline-flex self-start px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-md">{roleLabel}</span>
            </div>
          </div>

          <div className="w-full h-px bg-surface-border" />

          <div className="flex flex-col gap-4">
            <PfField icon={<Hash size={15} />}      label="Roll Number"  value={profile?.rollNumber} />
            <PfField icon={<Mail size={15} />}      label="Email"        value={profile?.email} />
            <PfField icon={<BookOpen size={15} />}  label="Department"   value={profile?.department} />
            <PfField icon={<Calendar size={15} />}  label="Joining Year" value={profile?.joiningYear} />
            <PfField icon={<Shield size={15} />}    label="Role"         value={roleLabel} />
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-[340px] shrink-0">
          {!editing ? (
            <>
              <div className="bg-surface-raised border border-surface-border rounded-xl p-5 shadow-[var(--shadow-card)] flex flex-col items-center text-center gap-3 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary-500/30">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 bg-primary-500/10 text-primary-500">
                  <Pencil size={22} />
                </div>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="font-bold text-lg text-text-primary">Update Details</span>
                  <span className="text-xs text-text-secondary leading-relaxed px-2">Edit your name, email and department</span>
                </div>
                <button
                  id="btn-update-details"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400"
                  onClick={startEdit}
                >
                  Edit
                </button>
              </div>

              <div className="bg-surface-raised border border-surface-border rounded-xl p-5 shadow-[var(--shadow-card)] flex flex-col items-center text-center gap-3 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-danger-500/30">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 bg-danger-500/10 text-danger-500">
                  <Trash2 size={22} />
                </div>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="font-bold text-lg text-text-primary">Delete Account</span>
                  <span className="text-xs text-text-secondary leading-relaxed px-2">Permanently remove all your data</span>
                </div>
                <button
                  id="btn-delete-account"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-danger-600 text-white hover:bg-danger-500 active:scale-95"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="bg-surface-raised border border-surface-border rounded-xl p-6 shadow-[var(--shadow-card)] animate-[fadeUp_0.3s_ease_both] border-t-[3px] border-t-primary-500">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-surface-border text-lg font-bold text-text-primary">
                <Pencil size={16} className="text-primary-500" />
                <span>Edit Profile</span>
              </div>
              <form id="profile-edit-form" onSubmit={handleUpdate} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pe-name" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Full Name</label>
                  <input
                    id="pe-name"
                    name="name"
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pe-email" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Email</label>
                  <input
                    id="pe-email"
                    name="email"
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pe-department" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Department</label>
                  <select
                    id="pe-department"
                    name="department"
                    className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                    value={editForm.department}
                    onChange={handleEditChange}
                    required
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-surface-border">
                  <button id="btn-save-profile" type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-primary-600 text-white hover:bg-primary-500" disabled={saving}>
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={15} /> Save</>}
                  </button>
                  <button
                    id="btn-cancel-edit"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay hover:text-text-primary"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" role="dialog" aria-modal="true">
          <div className="max-w-sm text-center flex flex-col gap-4 p-8 items-center bg-surface-raised border border-surface-border rounded-2xl shadow-[var(--shadow-card)] z-50 animate-[scaleIn_0.25s_ease_out]">
            <div className="w-16 h-16 rounded-full bg-danger-500/10 text-danger-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-[1.35rem] font-extrabold m-0 tracking-tight text-text-primary">Delete Account?</h2>
            <p className="text-[0.92rem] text-text-secondary leading-relaxed m-0">
              This will permanently delete your account, profile and all registrations.
              This action <strong className="text-text-primary">cannot be undone</strong>.
            </p>
            <div className="flex items-center gap-3 mt-2 justify-center">
              <button
                id="btn-confirm-delete"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-danger-600 text-white hover:bg-danger-500"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={15} /> Yes, Delete</>}
              </button>
              <button
                id="btn-cancel-delete"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay hover:text-text-primary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                <X size={15} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PfField({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-muted flex items-center justify-center text-primary-400 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.75rem] font-bold uppercase tracking-wider text-text-muted">{label}</span>
        <span className="text-[0.95rem] font-medium text-text-primary">{value ?? '—'}</span>
      </div>
    </div>
  );
}
