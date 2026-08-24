import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/auth';
import toast from 'react-hot-toast';
import { GraduationCap, Home, Users, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const homeRoute = user?.role === 'ROLE_ADMIN' ? '/admin/home' : '/home';

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logoutUser();
    } finally {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <nav className="sticky top-0 z-[100] bg-surface-raised/85 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center gap-6">
        <Link to={homeRoute} className="flex items-center gap-2 no-underline font-bold text-[1.05rem] text-text-primary shrink-0">
          <GraduationCap size={22} className="text-primary-400" />
          <span>CampusMS</span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          <Link to={homeRoute} className="inline-flex items-center gap-1.5 no-underline text-text-secondary text-[0.88rem] font-medium px-3 py-1.5 rounded-[0.625rem] transition-all duration-200 hover:text-text-primary hover:bg-surface-overlay">
            <Home size={16} />
            Home
          </Link>
          <Link to={user?.role === 'ROLE_ADMIN' ? '/admin/clubs' : '/clubs'} className="inline-flex items-center gap-1.5 no-underline text-text-secondary text-[0.88rem] font-medium px-3 py-1.5 rounded-[0.625rem] transition-all duration-200 hover:text-text-primary hover:bg-surface-overlay">
            <Users size={16} />
            Clubs
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto relative" ref={menuRef}>
          <button
            id="btn-avatar"
            className="flex items-center gap-1.5 bg-surface-overlay border border-surface-muted rounded-full pl-1 pr-3 py-1 cursor-pointer transition-all duration-200 hover:border-primary-500 hover:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[image:var(--gradient-brand)] text-white text-xs font-bold tracking-wide shrink-0">{initials}</span>
            <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-[calc(100%+10px)] right-0 min-w-[200px] bg-surface-raised border border-surface-muted rounded-[1rem] shadow-[var(--shadow-card)] overflow-hidden animate-[fadeUp_0.18s_ease_both] z-[200]" role="menu">
              <div className="flex flex-col gap-1 p-3 px-4">
                <span className="text-[0.9rem] font-bold text-text-primary">{user?.name}</span>
                <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-primary-400">{user?.role?.replace('ROLE_', '')}</span>
              </div>
              <div className="h-[1px] bg-surface-muted" />
              <Link
                id="dropdown-profile"
                to="/profile"
                className="flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-none text-text-secondary text-[0.88rem] font-medium cursor-pointer no-underline transition-colors duration-150 text-left hover:bg-surface-overlay hover:text-text-primary"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <User size={15} />
                Profile
              </Link>
              <button
                id="dropdown-logout"
                className="flex items-center gap-2.5 w-full px-4 py-3 bg-transparent border-none text-text-secondary text-[0.88rem] font-medium cursor-pointer no-underline transition-colors duration-150 text-left hover:bg-danger-500/10 text-danger-400 hover:text-danger-400"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
