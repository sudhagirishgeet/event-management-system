import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { PlusCircle, Calendar, DollarSign, Ticket, QrCode, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';

const OrganizerDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/organizer/analytics');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { summary, monthlyRevenue } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Organizer Studio
            <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs border border-brand-500/30 font-semibold">VERIFIED</span>
          </h1>
          <p className="text-xs text-slate-400">Track real-time event revenue, ticket sales distribution, and attendee check-ins</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/organizer/events/create"
            className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">₹{summary.totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Real-time ticket earnings
          </span>
        </div>

        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tickets Sold</span>
            <Ticket className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{summary.totalTicketsSold}</div>
          <span className="text-[10px] text-slate-400">Across all published tiers</span>
        </div>

        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Published Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{summary.publishedEvents} / {summary.totalEvents}</div>
          <span className="text-[10px] text-slate-400">Active event listings</span>
        </div>

        <div className="p-5 bg-dark-card border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Attendee Check-Ins</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{summary.totalCheckIns}</div>
          <span className="text-[10px] text-amber-400 font-semibold">Scanned at venue gates</span>
        </div>

      </div>

      {/* Recharts Revenue & Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="p-6 bg-dark-card border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Revenue Growth (INR)</span>
            <span className="text-xs text-slate-400 font-normal">Monthly Trend</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-dark-card border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Ticket Sales Volume</span>
            <span className="text-xs text-slate-400 font-normal">Volume Count</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Bar dataKey="sales" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrganizerDashboardPage;
