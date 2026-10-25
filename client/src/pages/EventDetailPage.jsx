import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Star, MessageSquare, HelpCircle, UserCheck, Send, Vote, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import BookingModal from '../components/BookingModal';

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Real-time Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data.event);
      } catch (err) {
        console.error('Failed to load event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Socket.IO Room Listeners
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_event_room', { eventId: id });

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || !socket) return;

    socket.emit('send_message', {
      eventId: id,
      userId: user.id,
      content: chatInput
    });
    setChatInput('');
  };

  const handleVotePoll = (pollId, optionId) => {
    if (!user || !socket) return alert('Please login to vote on live polls.');
    socket.emit('submit_vote', {
      pollId,
      optionId,
      userId: user.id,
      eventId: id
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to leave a review.');

    try {
      await api.post('/reviews', {
        eventId: id,
        rating: userRating,
        comment: userComment
      });
      setReviewSuccess('Thank you for reviewing this event!');
      setUserComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Review submission failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-brand-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3">
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-slate-400">The event you are looking for has been removed or does not exist.</p>
      </div>
    );
  }

  const startingPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : 0;

  return (
    <div className="space-y-12 pb-20">
      
      {/* Event Hero Banner */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/60 to-transparent" />

        <div className="absolute bottom-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full left-1/2 -translate-x-1/2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="px-3 py-1 rounded-full bg-brand-600/80 backdrop-blur-md text-xs font-semibold text-white">
              {event.category?.name}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-400" /> {new Date(event.startDate).toLocaleDateString()} at {event.startTime}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-400" /> {event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online'}</span>
              <span className="flex items-center gap-1.5 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /> {event.averageRating} ({event.reviewCount} reviews)</span>
            </div>
          </div>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-brand-500/25 shrink-0 flex items-center justify-center gap-2"
          >
            <Ticket className="w-5 h-5" />
            <span>Book Tickets ({startingPrice === 0 ? 'FREE' : `from ₹${startingPrice}`})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Left Details */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* About Event */}
          <section className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">About This Experience</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </section>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <section className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Keynote Speakers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakers.map(sp => (
                  <div key={sp.speaker.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                      {sp.speaker.photo ? <img src={sp.speaker.photo} alt={sp.speaker.name} className="w-full h-full object-cover" /> : <UserCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sp.speaker.name}</h4>
                      <p className="text-xs text-brand-400">{sp.speaker.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <section className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {event.faqs.map(faq => (
                  <div key={faq.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <h4 className="text-xs font-bold text-white">{faq.question}</h4>
                    <p className="text-xs text-slate-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Real-time Attendee Community Chat */}
          <section className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-400" />
              Live Attendee Chat Room (Socket.IO)
            </h3>

            <div className="h-56 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-3 text-xs">
              {messages.length === 0 ? (
                <p className="text-slate-500 italic text-center py-10">No messages yet. Be the first to start the conversation!</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="font-bold text-brand-300">{m.user?.name || 'Attendee'}:</span>
                    <span className="text-slate-300">{m.content}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={user ? "Say something to attendees..." : "Login to join the live chat"}
                value={chatInput}
                disabled={!user}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!user || !chatInput.trim()}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </section>

          {/* Attendee Reviews */}
          <section className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Reviews & Experiences</h3>

            {user && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
                <h4 className="font-semibold text-white">Leave a Review</h4>
                {reviewSuccess && <p className="text-emerald-400">{reviewSuccess}</p>}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`p-1 text-base ${star <= userRating ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your thoughts about this event..."
                  value={userComment}
                  onChange={e => setUserComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  rows={3}
                />
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold">
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-3">
              {event.reviews?.map(rev => (
                <div key={rev.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rev.user?.name}</span>
                    <span className="text-amber-400 font-bold">★ {rev.rating}.0</span>
                  </div>
                  <p className="text-slate-300">{rev.comment}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sticky Desktop Right Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-card border border-slate-800 p-6 rounded-2xl sticky top-24 space-y-6">
            <div>
              <span className="text-xs text-slate-400">Starting Price</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {startingPrice === 0 ? 'FREE' : `₹${startingPrice}`}
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Ticket className="w-5 h-5" />
              <span>Select Tickets</span>
            </button>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white">Event Organizer</h4>
              <p className="font-semibold text-brand-300">{event.organizer?.organizerProfile?.organization || event.organizer?.name}</p>
              <p className="text-slate-400">{event.organizer?.organizerProfile?.bio || 'Verified EventFlow Organizer'}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Refundable according to policy ({event.refundPolicyDays} days prior)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Checkout Dialog Modal */}
      {isBookingOpen && (
        <BookingModal event={event} onClose={() => setIsBookingOpen(false)} />
      )}
    </div>
  );
};

export default EventDetailPage;
