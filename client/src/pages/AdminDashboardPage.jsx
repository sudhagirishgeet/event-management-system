import React, { useEffect, useState } from 'react';
import { Shield, Users, Calendar, CheckCircle2, XCircle, FileText, DollarSign, Activity, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, eventsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/events?limit=50'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs')
      ]);
      setStats(analyticsRes.data.data.stats);
      setEvents(eventsRes.data.data.events);
      setUsers(usersRes.data.data.users);
      setAuditLogs(logsRes.data.data.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (eventId, status) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, { status });
      alert(`Event status updated to ${status}`);
      fetchAdminData();
    } catch (err) {
      alert('Status update failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-500" />
          Admin Control Center
        </h1>
        <p className="text-xs text-slate-400">Moderate platform events, oversee user accounts, inspect audit trails, and review system revenue</p>
      </div>

      {/* Platform Key Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Total Platform Revenue</span>
            <div className="text-2xl font-extrabold text-emerald-400">₹{stats.totalPlatformRevenue.toLocaleString()}</div>
          </div>

          <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Total Attendees</span>
            <div className="text-2xl font-extrabold text-white">{stats.totalUsers}</div>
          </div>

          <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Total Organizers</span>
            <div className="text-2xl font-extrabold text-purple-400">{stats.totalOrganizers}</div>
          </div>

          <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Pending Event Approvals</span>
            <div className="text-2xl font-extrabold text-amber-400">{stats.pendingEvents}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'events' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Moderation ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'logs' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Events Moderation Tab */}
      {activeTab === 'events' && (
        <div className="bg-dark-card border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Event Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Organizer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-white">{evt.title}</td>
                  <td className="p-3 text-brand-300">{evt.category?.name}</td>
                  <td className="p-3 text-slate-400">{evt.organizer?.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      evt.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {evt.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    {evt.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handleUpdateStatus(evt.id, 'PUBLISHED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {evt.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(evt.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-dark-card border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-white">{u.name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-dark-card border border-slate-800 rounded-2xl p-6 space-y-3">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-rose-400">{log.action}</span>
                <span className="text-slate-400 ml-2">by {log.user?.name || 'System'}</span>
              </div>
              <span className="text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
