import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetAllStudents, adminDeleteStudent } from '../api/admin';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Search, Loader2, Trash2,
  ChevronLeft, ChevronRight, ChevronDown,
  Mail, BookOpen, Calendar, X,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology',
];

export default function AdminStudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents]           = useState([]);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch]               = useState('');
  const [department, setDepartment]       = useState('');
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [deleteBusy, setDeleteBusy]       = useState(null);
  const searchTimer = useRef(null);

  const fetchStudents = useCallback(async (p, dept, q) => {
    setLoading(true);
    try {
      const r = await adminGetAllStudents(dept, q, p);
      const pg = r.data.data;
      setStudents(pg.content);
      setTotalPages(pg.totalPages);
      setTotalElements(pg.totalElements);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      fetchStudents(0, department, search);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search, department, fetchStudents]);

  useEffect(() => { fetchStudents(page, department, search); }, [page]);

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete "${student.name}" (${student.rollNumber})?`)) return;
    setDeleteBusy(student.userId);
    try {
      await adminDeleteStudent(student.userId);
      setStudents((prev) => prev.filter((s) => s.userId !== student.userId));
      if (selected?.userId === student.userId) setSelected(null);
      toast.success('Student deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeleteBusy(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex flex-col gap-3 mb-6">
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-transparent self-start -ml-2 text-text-muted hover:text-text-primary mb-1 hover:bg-surface-overlay" onClick={() => navigate('/admin/home')}>
          <ArrowLeft size={15} /> Dashboard
        </button>
        <div>
          <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Manage Students</h1>
          <p className="text-sm text-text-muted mt-1 m-0 font-medium">{totalElements} students registered</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex items-center" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={14} className="absolute left-4 text-text-muted" />
          <input
            id="student-search"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-overlay border border-surface-muted rounded-xl text-[0.95rem] text-text-primary transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] placeholder:text-text-muted"
            placeholder="Search by name, roll or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative flex items-center min-w-[200px]">
          <ChevronDown size={13} className="absolute right-4 text-text-muted pointer-events-none" />
          <select
            id="student-dept-filter"
            className="w-full px-4 py-2.5 pr-10 bg-surface-overlay border border-surface-muted rounded-xl text-[0.95rem] text-text-primary appearance-none cursor-pointer transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted"><Loader2 size={36} className="animate-spin text-primary-500" /></div>
      ) : students.length === 0 ? (
        <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No students found.</div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mb-10">
            {students.map((s) => (
              <StudentChip key={s.userId} student={s} onClick={() => setSelected(s)} />
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

      {selected && (
        <StudentDetailModal
          student={selected}
          deleteBusy={deleteBusy === selected.userId}
          onDelete={() => handleDelete(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function StudentChip({ student, onClick }) {
  const initials = student.name?.slice(0, 2).toUpperCase() ?? '??';
  return (
    <button id={`stu-chip-${student.userId}`} className="flex items-center gap-3 p-3 bg-surface-raised border border-surface-border rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-500/30 text-left" onClick={onClick} title={student.name}>
      <div className="w-10 h-10 rounded-[0.6rem] bg-[image:var(--gradient-brand)] text-white flex items-center justify-center font-bold text-sm shadow-[var(--shadow-glow-sm)] shrink-0">{initials}</div>
      <span className="font-bold text-[0.95rem] text-text-primary truncate">{student.name}</span>
    </button>
  );
}

function StudentDetailModal({ student, deleteBusy, onDelete, onClose }) {
  const initials = student.name?.slice(0, 2).toUpperCase() ?? '??';

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-raised border border-surface-border rounded-2xl flex flex-col max-h-[90vh] shadow-[var(--shadow-card)] z-50 animate-[scaleIn_0.2s_ease_out] max-w-md w-full">
        <div className="flex items-center gap-4 p-5 border-b border-surface-border relative">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-brand)] text-white flex items-center justify-center font-bold text-xl shadow-lg shrink-0">{initials}</div>
          <div className="flex flex-col gap-0.5 flex-1">
            <h2 className="font-bold text-xl text-text-primary m-0 tracking-tight leading-tight">{student.name}</h2>
            <span className="text-sm font-semibold font-mono text-primary-400 uppercase tracking-wider">#{student.rollNumber}</span>
          </div>
          <button className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 flex items-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-text-primary absolute top-4 right-4" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-0 p-3 overflow-y-auto">
          <div className="flex items-center gap-4 p-4 border-b border-surface-border/50 last:border-b-0">
            <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-muted flex items-center justify-center text-text-muted shrink-0"><Mail size={14} /></div>
            <div>
              <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-text-muted mb-0.5">Email</span>
              <span className="block text-[0.95rem] font-medium text-text-primary">{student.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-b border-surface-border/50 last:border-b-0">
            <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-muted flex items-center justify-center text-text-muted shrink-0"><BookOpen size={14} /></div>
            <div>
              <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-text-muted mb-0.5">Department</span>
              <span className="block text-[0.95rem] font-medium text-text-primary">{student.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-b border-surface-border/50 last:border-b-0">
            <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-muted flex items-center justify-center text-text-muted shrink-0"><Calendar size={14} /></div>
            <div>
              <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-text-muted mb-0.5">Joining Year</span>
              <span className="block text-[0.95rem] font-medium text-text-primary">{student.joiningYear}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-border shrink-0">
          <button
            id={`btn-del-student-${student.userId}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 bg-danger-600 text-white hover:bg-danger-500"
            onClick={onDelete}
            disabled={deleteBusy}
          >
            {deleteBusy
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 size={14} /> Delete Student</>}
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer bg-transparent border border-transparent hover:bg-surface-overlay text-text-muted hover:text-text-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
