import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Tag, SlidersHorizontal, Loader2 } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';

const EventDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});

  // Local Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/events/categories');
        setCategories(res.data.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryString = searchParams.toString();
        const res = await api.get(`/events?${queryString}`);
        setEvents(res.data.data.events);
        setMeta(res.data.data.meta);
      } catch (err) {
        console.error('Error loading event directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [searchParams]);

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (location) params.set('location', location);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setLocation('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Event Directory</h1>
        <p className="text-sm text-slate-400">Discover top conferences, live shows, workshops, and meetups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 bg-dark-card border border-slate-800 p-5 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-400" />
              Filters
            </h3>
            <button onClick={clearFilters} className="text-xs text-brand-400 hover:underline font-medium">
              Reset
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4 text-xs">
            {/* Search Input */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Title or topic..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">City / Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Bengaluru"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Price Cap */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Ticket Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Main Event Grid Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-brand-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center bg-dark-card border border-slate-800 rounded-2xl space-y-3">
              <Filter className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No events found matching your criteria</h3>
              <p className="text-xs text-slate-400">Try loosening your search filters or exploring all categories.</p>
              <button onClick={clearFilters} className="px-4 py-2 bg-slate-800 text-xs font-semibold text-white rounded-lg hover:bg-slate-700">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(evt => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EventDirectoryPage;
