import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Heart, Award, Bell, QrCode, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AttendeeDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, favRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/favorites/my')
        ]);
        setBookings(bookRes.data.data.bookings);
        setFavorites(favRes.data.data.favorites);
      } catch (err) {
        console.error('Failed to load attendee dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Welcome Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900/50 via-dark-card to-dark-card border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-xs text-slate-400">Manage your active tickets, saved experiences, and participation certificates.</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'tickets' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" />
          My Tickets ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'saved' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          Saved Favorites ({favorites.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-dark-card border border-slate-800 rounded-2xl space-y-3">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No active event bookings</h3>
              <p className="text-xs text-slate-400">You haven't purchased any tickets yet. Explore upcoming events!</p>
              <Link to="/events" className="inline-block px-4 py-2 bg-brand-600 text-xs font-semibold text-white rounded-xl shadow">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(b => (
                <div key={b.id} className="p-5 bg-dark-card border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{b.bookingNumber}</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{b.event?.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      {new Date(b.event?.startDate).toLocaleDateString()} at {b.event?.startTime}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Amount</span>
                      <span className="text-sm font-bold text-emerald-400">₹{b.finalAmount}</span>
                    </div>

                    <Link
                      to={`/my-tickets/${b.id}`}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Ticket
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map(evt => (
            <div key={evt.id} className="p-4 bg-dark-card border border-slate-800 rounded-2xl space-y-3">
              <img src={evt.bannerImage} alt={evt.title} className="w-full h-36 object-cover rounded-xl" />
              <h4 className="text-sm font-bold text-white">{evt.title}</h4>
              <Link to={`/events/${evt.id}`} className="block text-center py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl">
                View Event
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AttendeeDashboardPage;
