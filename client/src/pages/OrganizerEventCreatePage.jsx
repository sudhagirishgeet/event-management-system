import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Plus, Trash2, MapPin, Ticket, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const OrganizerEventCreatePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [eventType, setEventType] = useState('OFFLINE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [capacity, setCapacity] = useState(500);
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200');
  const [contactEmail, setContactEmail] = useState('');
  
  // Venue
  const [venueName, setVenueName] = useState('HITEX Exhibition Center');
  const [venueAddress, setVenueAddress] = useState('Trade Fair Office Building');
  const [venueCity, setVenueCity] = useState('Hyderabad');

  // Ticket Tiers
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Pass', price: 499, quantity: 400 },
    { name: 'VIP Pass', price: 1499, quantity: 100 }
  ]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/events/categories');
        setCategories(res.data.data.categories);
        if (res.data.data.categories.length) {
          setCategoryId(res.data.data.categories[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleGenerateAI = async () => {
    if (!title.trim()) return alert('Please enter a topic/title first for AI generation.');

    try {
      setAiGenerating(true);
      const res = await api.post('/ai/generate-description', {
        topic: title,
        targetAudience: 'professionals and enthusiasts',
        duration: '1-day'
      });
      const data = res.data.data;
      setTitle(data.title);
      setDescription(data.description);
      setShortDescription(data.shortDescription);
    } catch (err) {
      alert('AI generation failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddTicketTier = () => {
    setTicketTiers(prev => [...prev, { name: 'Tier Pass', price: 299, quantity: 100 }]);
  };

  const handleRemoveTicketTier = (index) => {
    setTicketTiers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create Event
      const eventRes = await api.post('/events', {
        title,
        description,
        shortDescription,
        categoryId,
        eventType,
        startDate: startDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        endDate: endDate || new Date(Date.now() + 86400000 * 8).toISOString(),
        startTime,
        endTime,
        capacity: Number(capacity),
        bannerImage,
        contactEmail: contactEmail || 'organizer@eventflow.com',
        venue: eventType !== 'ONLINE' ? {
          name: venueName,
          address: venueAddress,
          city: venueCity,
          state: 'State',
          country: 'India'
        } : undefined
      });

      const event = eventRes.data.data.event;

      // 2. Add Ticket Tiers
      for (const tier of ticketTiers) {
        await api.post(`/events/${event.id}/tickets`, {
          name: tier.name,
          price: Number(tier.price),
          quantity: Number(tier.quantity),
          saleStart: new Date().toISOString(),
          saleEnd: new Date(Date.now() + 86400000 * 30).toISOString()
        });
      }

      alert('Event created and ticket tiers configured!');
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-400" />
          Create New Event
        </h1>
        <p className="text-xs text-slate-400">Fill in event details, add ticket pricing, and leverage AI content generation</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        
        {/* Step 1: Core Details */}
        <div className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">1. Core Information</h3>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiGenerating}
              className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold hover:bg-purple-500/20 flex items-center gap-1.5 transition-all"
            >
              {aiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
              <span>Autofill with AI</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. AI & Full-Stack Tech Summit 2026"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Format</label>
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="OFFLINE">In-Person (Offline)</option>
                <option value="ONLINE">Virtual (Online Stream)</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe what attendees will learn and experience..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
            <input
              type="text"
              required
              value={bannerImage}
              onChange={e => setBannerImage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Step 2: Date & Venue */}
        <div className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">2. Schedule & Venue</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Venue Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {eventType !== 'ONLINE' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Venue Center Name</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={e => setVenueAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={venueCity}
                  onChange={e => setVenueCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Ticket Pricing Tiers */}
        <div className="bg-dark-card border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-400" />
              3. Ticket Tiers & Pricing
            </h3>
            <button
              type="button"
              onClick={handleAddTicketTier}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>

          <div className="space-y-3">
            {ticketTiers.map((tier, idx) => (
              <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Tier Name (e.g. VIP)"
                  value={tier.name}
                  onChange={e => {
                    const updated = [...ticketTiers];
                    updated[idx].name = e.target.value;
                    setTicketTiers(updated);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={tier.price}
                  onChange={e => {
                    const updated = [...ticketTiers];
                    updated[idx].price = e.target.value;
                    setTicketTiers(updated);
                  }}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={tier.quantity}
                  onChange={e => {
                    const updated = [...ticketTiers];
                    updated[idx].quantity = e.target.value;
                    setTicketTiers(updated);
                  }}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTicketTier(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Publish Event & Tiers</span> <CheckCircle className="w-5 h-5" /></>}
        </button>

      </form>
    </div>
  );
};

export default OrganizerEventCreatePage;
