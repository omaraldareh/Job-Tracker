import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');    
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-surface-muted text-brand-400 border border-surface-border'
        : 'text-slate-400 hover:text-white hover:bg-surface-muted/50'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-surface-border z-40">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            JobTrackr<span className="text-xs font-mono font-normal ml-1 text-slate-500">v2</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>Dashboard</Link>
            <Link to="/jobs" className={linkClass('/jobs')}>Applications</Link>
            <Link to="/analytics" className={linkClass('/analytics')}>Analytics</Link>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors px-3 py-2"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}