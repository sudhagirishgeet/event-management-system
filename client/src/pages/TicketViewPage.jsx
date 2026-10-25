import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Download, ArrowLeft, Calendar, MapPin, CheckCircle, AlertOctagon, Loader2 } from 'lucide-react';
import api from '../services/api';

const TicketViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data.booking);
      } catch (err) {
        console.error('Failed to load ticket:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/bookings/${id}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EventFlow-Ticket-${booking.bookingNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF ticket.');
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking according to refund policy?')) return;
    try {
      setCancelling(true);
      const res = await api.post(`/bookings/${id}/cancel`);
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3">
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">The requested ticket pass does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      <button onClick={() => navigate('/dashboard')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Digital Ticket Card */}
      <div className="bg-dark-card border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-brand-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">EventFlow Pass</h2>
              <p className="text-[10px] opacity-80">Official Verified Digital Entry Ticket</p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold bg-white/20 px-2.5 py-1 rounded-md">
            {booking.bookingNumber}
          </span>
        </div>

        {/* Details & QR Code */}
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Event</span>
            <h3 className="text-xl font-extrabold text-white">{booking.event?.title}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Attendee</span>
              <span className="font-bold text-white">{booking.user?.name}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {booking.status}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Date & Time</span>
              <span className="font-semibold text-slate-200">{new Date(booking.event?.startDate).toLocaleDateString()}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Venue</span>
              <span className="font-semibold text-slate-200">{booking.event?.venue ? booking.event.venue.city : 'Online'}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-6 bg-white rounded-2xl flex flex-col items-center justify-center space-y-3">
            <QRCodeSVG value={booking.qrSecret} size={180} />
            <span className="text-[10px] font-mono text-slate-800">Secret: {booking.qrSecret.substring(0, 18)}...</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Pass</span>
            </button>

            {booking.status === 'CONFIRMED' && (
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl border border-rose-500/30 transition-all"
              >
                Cancel & Refund
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketViewPage;
