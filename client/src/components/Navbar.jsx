import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Search, Sparkles, Ticket, User, LogOut, Shield, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AIChatbotModal from './AIChatbotModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Event<span className="gradient-text">Flow</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/events" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4 text-slate-400" />
                Explore Events
              </Link>

              {user?.role === 'ORGANIZER' && (
                <Link to="/organizer/events/create" className="text-sm font-medium text-slate-300 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-brand-500" />
                  Create Event
                </Link>
              )}

              {user?.role === 'ATTENDEE' && (
                <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-slate-400" />
                  My Tickets
                </Link>
              )}
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              {/* AI Chatbot Assistant Button */}
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>AI Assistant</span>
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin/dashboard" className="px-3 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  )}

                  {user.role === 'ORGANIZER' && (
                    <Link to="/organizer/dashboard" className="px-3 py-1.5 text-xs font-semibold bg-brand-500/20 text-brand-300 rounded-lg border border-brand-500/30 flex items-center gap-1">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Studio
                    </Link>
                  )}

                  <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                    <span className="text-sm font-medium text-slate-200 hidden sm:inline">{user.name}</span>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 rounded-lg shadow-md shadow-brand-500/25 transition-all">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* AI Chatbot Dialog Modal */}
      {isAIChatOpen && <AIChatbotModal onClose={() => setIsAIChatOpen(false)} />}
    </>
  );
};

export default Navbar;
