import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users } from 'lucide-react';

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-raised border border-surface-border rounded-2xl p-8 shadow-[var(--shadow-card)] flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight m-0">
            Complete Your Profile
          </h1>
          <p className="text-sm text-text-secondary m-0">
            Hi <strong className="text-text-primary">{user?.name}</strong>! Choose how you want to join the campus.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            id="btn-select-student"
            className="flex items-center gap-5 p-5 bg-surface-overlay border-2 border-surface-muted rounded-xl text-left cursor-pointer transition-all duration-200 hover:border-primary-500 hover:shadow-[var(--shadow-glow-sm)] hover:-translate-y-1"
            onClick={() => navigate('/create-student-profile')}
          >
            <div className="shrink-0 w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
              <GraduationCap size={36} />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="font-bold text-lg text-text-primary">Student</span>
              <span className="text-sm text-text-muted leading-relaxed m-0">
                Register as a student and access campus events, clubs &amp; resources.
              </span>
            </div>
          </button>


          <button
            id="btn-select-leader"
            className="flex items-center gap-5 p-5 bg-surface-overlay border-2 border-surface-muted rounded-xl text-left cursor-not-allowed transition-all duration-200 opacity-50 grayscale"
            disabled
            title="Coming soon"
          >
            <div className="shrink-0 w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
              <Users size={36} />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="font-bold text-lg text-text-primary">Club Leader</span>
              <span className="text-sm text-text-muted leading-relaxed m-0">
                Manage a club or society. (Coming soon)
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
