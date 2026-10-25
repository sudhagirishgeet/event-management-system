import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, UserCheck, CheckCircle2, Search, Loader2 } from 'lucide-react';
import api from '../services/api';
import QRScannerModal from '../components/QRScannerModal';

const OrganizerCheckInPage = () => {
  const { id } = useParams();
  const [checkIns, setCheckIns] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCheckIns = async () => {
    try {
      const res = await api.get(`/events/${id}/checkins`);
      setCheckIns(res.data.data.checkIns);
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, [id]);

  const filteredCheckIns = checkIns.filter(ci =>
    ci.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    ci.user?.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-400" />
            Gate Check-In & Attendee Roster
          </h1>
          <p className="text-xs text-slate-400">Scan digital QR passes and monitor gate check-in statistics in real time</p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Camera QR Scanner</span>
        </button>
      </div>

      {/* Gate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Checked-In</span>
          <div className="text-3xl font-extrabold text-emerald-400">{stats.checkedInCount || 0}</div>
        </div>

        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Total Confirmed Bookings</span>
          <div className="text-3xl font-extrabold text-white">{stats.totalConfirmedBookings || 0}</div>
        </div>

        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Gate Check-In Rate</span>
          <div className="text-3xl font-extrabold text-brand-400">{stats.checkInRatePercentage || 0}%</div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-dark-card border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Checked-In Attendees</h3>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search attendee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-brand-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : filteredCheckIns.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8 italic">No attendees checked in yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Attendee Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Checked In Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCheckIns.map(ci => (
                  <tr key={ci.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-white">{ci.user?.name}</td>
                    <td className="p-3 text-slate-400">{ci.user?.email}</td>
                    <td className="p-3 font-mono text-brand-300">{ci.booking?.bookingNumber}</td>
                    <td className="p-3 text-slate-400">{new Date(ci.checkedInAt).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Entry Granted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isScannerOpen && (
        <QRScannerModal
          eventId={id}
          onClose={() => {
            setIsScannerOpen(false);
            fetchCheckIns();
          }}
        />
      )}

    </div>
  );
};

export default OrganizerCheckInPage;
