import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Heart, Tag } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EventCard = ({ event }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Please login to save favorite events.');

    try {
      const res = await api.post(`/favorites/${event.id}`);
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-dark-card border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col"
    >
      {/* Banner Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-dark-base/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-brand-300 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {event.category?.name || 'Event'}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-dark-base/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-all"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Event Format Tag */}
        <div className="absolute bottom-3 left-3 text-xs font-medium text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded">
          {event.eventType}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {event.shortDescription || event.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-300 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>{formattedDate} • {event.startTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{event.venue ? `${event.venue.name}, ${event.venue.city}` : 'Online Experience'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Price & Rating */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Starts from</span>
            <span className="text-sm font-bold text-emerald-400">
              {event.startingPrice === 0 ? 'FREE' : `₹${event.startingPrice}`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{event.averageRating || '5.0'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
