import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useCallback } from 'react';
import useStore from '../store/useStore';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl text-white flex items-center">
                <span className="font-bold">athena</span>
                <span className="font-light">Poker</span>
                <span className="ml-2 text-base font-light opacity-75">|</span>
                <img src="/athenahealth-logo.png" alt="athenahealth logo" className="h-5 ml-2" style={{filter: 'brightness(0) invert(1)'}} />
                <span className="ml-1 text-base font-light opacity-75">athenahealth</span>
              </div>
            </Link>

            <nav className="flex items-center space-x-3 text-white">
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-primary-500/40 hover:bg-primary-500/60 border border-white/20 flex items-center justify-center transition-colors"
                title="Profile"
              >
                <User size={18} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-primary-500/40 hover:bg-primary-500/60 border border-white/20 flex items-center justify-center transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} <span className="font-semibold">athena</span><span className="font-light">Poker</span> by <img src="/athenahealth-logo.png" alt="athenahealth logo" className="h-4 mx-1 inline-block align-text-bottom" /> athenahealth. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
