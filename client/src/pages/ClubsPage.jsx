import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClubs } from '../api/club';
import toast from 'react-hot-toast';
import { Users, Loader2, ArrowRight, Zap, Music2, Trophy, Search } from 'lucide-react';

const CATEGORIES = ['ALL', 'TECHNICAL', 'CULTURAL', 'SPORTS'];

const CATEGORY_ICON = {
  TECHNICAL: <Zap size={16} />,
  CULTURAL:  <Music2 size={16} />,
  SPORTS:    <Trophy size={16} />,
};

const CATEGORY_COLOR = {
  TECHNICAL: 'cat-technical',
  CULTURAL:  'cat-cultural',
  SPORTS:    'cat-sports',
};

export default function ClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('ALL');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAllClubs()
      .then((res) => setClubs(res.data.data))
      .catch(() => toast.error('Failed to load clubs'))
      .finally(() => setLoading(false));
  }, []);

  const visible = clubs.filter((c) => {
    const matchTab = tab === 'ALL' || c.category === tab;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.clubCode.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-5 pb-10 xl:p-8 animate-[fadeUp_0.4s_ease_both]">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[2rem] font-extrabold m-0 text-transparent bg-clip-text bg-[image:var(--gradient-brand)] tracking-tight">Campus Clubs</h1>
          <p className="text-sm text-text-muted mt-1 m-0 font-medium">{clubs.length} clubs across {CATEGORIES.length - 1} categories</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-surface-overlay p-2 md:p-3 rounded-2xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`tab-${cat.toLowerCase()}`}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[0.6rem] font-bold text-[0.8rem] uppercase tracking-wider border-none cursor-pointer transition-all duration-200 whitespace-nowrap ${tab === cat ? 'bg-primary-500 text-white shadow-[0_4px_12px_rgba(139,92,246,0.25)] hover:bg-primary-500 hover:text-white' : 'bg-transparent text-text-muted hover:bg-surface-raised hover:text-text-primary'}`}
              onClick={() => setTab(cat)}
            >
              {cat === 'ALL' ? <Users size={14} /> : CATEGORY_ICON[cat]}
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative flex items-center w-full md:max-w-xs shrink-0">
          <Search size={15} className="absolute left-4 text-text-muted" />
          <input
            id="clubs-search"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-surface-muted rounded-xl text-[0.95rem] text-text-primary transition-colors focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] placeholder:text-text-muted"
            placeholder="Search by name, code or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
          <Loader2 size={36} className="animate-spin text-primary-500" />
          <span className="font-medium">Loading clubs…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center p-12 bg-surface-raised border border-surface-border rounded-2xl text-text-muted shadow-[var(--shadow-card)]">No clubs match your search.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 mb-10">
          {visible.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onView={() => navigate(`/clubs/${club.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClubCard({ club, onView }) {
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
        {!club.active && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[0.4rem] font-bold text-[0.68rem] uppercase tracking-wider bg-surface-muted text-text-muted border border-surface-border mt-1 self-start">Inactive</span>}
      </div>

      <button
        id={`btn-see-club-${club.id}`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] font-semibold text-sm transition-colors duration-200 cursor-pointer bg-transparent border border-surface-muted text-text-primary hover:border-primary-500 hover:text-primary-400 mt-auto"
        onClick={onView}
      >
        See Club <ArrowRight size={14} />
      </button>
    </div>
  );
}
