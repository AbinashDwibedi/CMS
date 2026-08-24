import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const userData = res.data.data;
      login(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      console.log(userData);
      if (!userData.profileCompleted) {
        navigate('/complete-profile');
      } else if (userData.role === 'ROLE_ADMIN') {
        navigate('/admin/home');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-raised border border-surface-border rounded-2xl p-8 shadow-[var(--shadow-card)] relative overflow-hidden flex flex-col gap-8 animate-[fadeUp_0.4s_ease_both]">
        
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-brand)] flex items-center justify-center text-white shadow-[var(--shadow-glow)] mb-2">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight m-0">Welcome back</h1>
          <p className="text-sm text-text-secondary m-0">Sign in to your CampusMS account</p>
        </div>

        <form id="login-form" className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-name" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
              Username
            </label>
            <input
              id="login-name"
              name="name"
              type="text"
              className="w-full px-3.5 py-2.5 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
              placeholder="Enter your username"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="w-full px-3.5 py-2.5 pr-10 bg-surface-overlay border border-surface-muted rounded-[0.625rem] text-text-primary text-[0.92rem] transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] placeholder:text-text-muted"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                id="toggle-password"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-text-muted cursor-pointer p-0 flex items-center transition-colors hover:text-text-primary"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-[1px] active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-2">
          Don&apos;t have an account?{' '}
          <Link id="link-register" to="/register" className="text-primary-400 font-semibold no-underline hover:text-primary-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
