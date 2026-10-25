import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Calendar, MapPin, TrendingUp, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evtRes, catRes] = await Promise.all([
          api.get('/events?limit=6'),
          api.get('/events/categories')
        ]);
        setFeaturedEvents(evtRes.data.data.events);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/30 to-purple-600/30 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Next-Gen Smart Ticketing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Discover Events. <br />
            <span className="gradient-text">Create Unforgettable Experiences.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Find tech conferences, concerts, workshops, and VC summits. Book verified digital QR tickets with instant instant check-in.
          </p>

          {/* Search Hero Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-3xl mx-auto p-2 rounded-2xl glass-panel shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-800"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-400 w-full">
              <Search className="w-5 h-5 text-brand-400 shrink-0" />
              <input
                type="text"
                placeholder="Search events, topics, or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 w-full">
              <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
              <input
                type="text"
                placeholder="City or Location..."
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all shrink-0"
            >
              Explore Events
            </button>
          </form>
        </div>
      </section>

      {/* Category Pills Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Categories</h2>
            <p className="text-xs text-slate-400">Browse events tailored to your passions</p>
          </div>
          <Link to="/events" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.slug}`}
              className="p-4 bg-dark-card border border-slate-800 rounded-2xl hover:border-brand-500/50 hover:bg-slate-800/80 transition-all text-center group"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-800 group-hover:bg-brand-600/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-all">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-brand-300">{cat.name}</h3>
              <span className="text-[10px] text-slate-500">{cat._count?.events || 0} Events</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending & Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              Trending Experiences
            </h2>
            <p className="text-xs text-slate-400">Top-rated upcoming conferences & concerts</p>
          </div>
          <Link to="/events" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900/40 via-purple-900/30 to-dark-card border border-brand-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Are you an Event Creator or Organizer?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Publish events, manage ticket tiers, track real-time revenue analytics, and scan attendee QR passes seamlessly.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link to="/register" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all">
                Become an Organizer
              </Link>
              <Link to="/organizer/dashboard" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all">
                Organizer Studio
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-1">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-lg font-bold text-white">100% Secure</div>
              <div className="text-[10px] text-slate-400">Razorpay Verified</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-1">
              <Award className="w-6 h-6 text-amber-400 mx-auto" />
              <div className="text-lg font-bold text-white">Certificates</div>
              <div className="text-[10px] text-slate-400">PDF Certificates</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
