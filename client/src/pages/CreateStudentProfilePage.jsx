import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudentProfile } from '../api/student';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, ArrowRight } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Chemical',
  'Biotechnology',
];

const CURRENT_YEAR = new Date().getFullYear();
const JOINING_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function CreateStudentProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: '',
    joiningYear: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStudentProfile({
        ...form,
        joiningYear: Number(form.joiningYear),
      });
      toast.success('Student profile created successfully!');

      login({ ...user, profileCompleted: true });


      if (user?.role === 'ROLE_ADMIN') {
        navigate('/admin/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to create profile. Try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] bg-surface-raised border border-surface-border rounded-2xl p-8 shadow-[var(--shadow-card)] relative overflow-hidden flex flex-col gap-8 animate-[fadeUp_0.4s_ease_both]">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-brand)] flex items-center justify-center text-white shadow-[var(--shadow-glow)] mb-2">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-[1.4rem] font-extrabold text-text-primary tracking-tight m-0">
            Student Profile
          </h1>
          <p className="text-sm text-text-secondary m-0">
            Fill in your academic details to complete registration.
          </p>
        </div>

        <form id="student-profile-form" className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sp-roll" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Roll Number</label>
            <input
              id="sp-roll"
              name="rollNumber"
              type="text"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="e.g. CS2021001"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />
          </div>


          <div className="flex flex-col gap-1.5">
            <label htmlFor="sp-name" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Full Name</label>
            <input
              id="sp-name"
              name="name"
              type="text"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>


          <div className="flex flex-col gap-1.5">
            <label htmlFor="sp-email" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Email</label>
            <input
              id="sp-email"
              name="email"
              type="email"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="student@college.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="flex flex-col gap-1.5">
            <label htmlFor="sp-department" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Department</label>
            <select
              id="sp-department"
              name="department"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
              value={form.department}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>


          <div className="flex flex-col gap-1.5">
            <label htmlFor="sp-year" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Joining Year</label>
            <select
              id="sp-year"
              name="joiningYear"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
              value={form.joiningYear}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select year</option>
              {JOINING_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-create-profile"
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-[1px] active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Profile <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
