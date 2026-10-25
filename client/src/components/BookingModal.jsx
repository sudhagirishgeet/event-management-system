import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ticket, ShieldCheck, Tag, CreditCard, Loader2 } from 'lucide-react';
import api from '../services/api';

const BookingModal = ({ event, onClose }) => {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQtyChange = (ticketTypeId, delta, maxAvailable) => {
    const current = selectedTickets[ticketTypeId] || 0;
    const next = Math.max(0, Math.min(maxAvailable, current + delta));
    setSelectedTickets(prev => ({ ...prev, [ticketTypeId]: next }));
  };

  const rawTotal = event.ticketTypes.reduce((acc, t) => {
    const qty = selectedTickets[t.id] || 0;
    return acc + (t.price * qty);
  }, 0);

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setError(null);
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        amount: rawTotal
      });
      setDiscountInfo(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const finalAmount = discountInfo ? discountInfo.finalAmount : rawTotal;

  const handleCheckout = async () => {
    if (totalTickets === 0) {
      return setError('Please select at least one ticket.');
    }

    try {
      setLoading(true);
      setError(null);

      const items = Object.entries(selectedTickets)
        .filter(([_, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

      // Step 1: Create Booking in backend
      const bookingRes = await api.post('/bookings', {
        eventId: event.id,
        couponCode: couponCode || undefined,
        items
      });

      const booking = bookingRes.data.data.booking;

      // Free Event Shortcut
      if (finalAmount === 0) {
        await api.post('/payments/verify', {
          bookingId: booking.id,
          razorpay_order_id: 'order_free',
          razorpay_payment_id: 'pay_free',
          razorpay_signature: 'sig_free'
        });
        setLoading(false);
        onClose();
        return navigate(`/my-tickets/${booking.id}`);
      }

      // Step 2: Initialize Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking.id
      });

      const orderData = orderRes.data.data;

      // Razorpay Modal Options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EventFlow',
        description: `Tickets for ${event.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'mock_sig'
            });
            onClose();
            navigate(`/my-tickets/${booking.id}`);
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'Attendee User',
          email: 'attendee@eventflow.com'
        },
        theme: {
          color: '#6366f1'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Local Fallback simulation if Razorpay JS SDK script blocked
        await api.post('/payments/verify', {
          bookingId: booking.id,
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_sig'
        });
        setLoading(false);
        onClose();
        navigate(`/my-tickets/${booking.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-base/80 backdrop-blur-md">
      <div className="bg-dark-card border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand-400" />
              Select Tickets
            </h3>
            <p className="text-xs text-slate-400">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Ticket Tiers List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {event.ticketTypes.map(ticket => (
            <div key={ticket.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{ticket.name}</h4>
                <span className="text-xs font-bold text-emerald-400">
                  {ticket.price === 0 ? 'FREE' : `₹${ticket.price}`}
                </span>
                <span className="text-[10px] text-slate-500 block">{ticket.availableQty} remaining</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => handleQtyChange(ticket.id, -1, ticket.availableQty)}
                  className="w-6 h-6 rounded bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-semibold text-white w-4 text-center">
                  {selectedTickets[ticket.id] || 0}
                </span>
                <button
                  onClick={() => handleQtyChange(ticket.id, 1, ticket.availableQty)}
                  className="w-6 h-6 rounded bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Coupon Code (e.g. WELCOME20)"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          </div>
          <button
            onClick={applyCoupon}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
          >
            Apply
          </button>
        </div>

        {/* Summary Box */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal ({totalTickets} tickets)</span>
            <span>₹{rawTotal}</span>
          </div>

          {discountInfo && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Coupon Discount ({discountInfo.code})</span>
              <span>-₹{discountInfo.calculatedDiscount}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
            <span>Total Payable</span>
            <span className="text-emerald-400">₹{finalAmount}</span>
          </div>
        </div>

        {/* Pay CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading || totalTickets === 0}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Pay ₹{finalAmount}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Secured by Razorpay HMAC-SHA256 Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
