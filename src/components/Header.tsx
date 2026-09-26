import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#d4af37] rounded-lg flex items-center justify-center">
            <span className="text-[#1a1f3a] font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold text-[#1a1f3a]">NextUp</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/youth" className="text-sm font-semibold text-gray-600 hover:text-[#1a1f3a]">Youth</Link>
          <Link to="/families" className="text-sm font-semibold text-gray-600 hover:text-[#1a1f3a]">Families</Link>
          <Link to="/about" className="text-sm font-semibold text-gray-600 hover:text-[#1a1f3a]">About</Link>
          {user ? (
            <Link to="/dashboard" className="text-sm font-bold text-white bg-[#1a1f3a] px-4 py-2 rounded-lg">Dashboard</Link>
          ) : (
            <Link to="/signin" className="text-sm font-bold text-white bg-[#1a1f3a] px-4 py-2 rounded-lg">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
