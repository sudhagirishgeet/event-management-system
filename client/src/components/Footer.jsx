import React from 'react';
import { Calendar, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-card border-t border-slate-800 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">EventFlow</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart Event Management & Ticketing Platform. Discover conferences, concerts, workshops, and exclusive experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/events?category=technology" className="hover:text-brand-400 transition-colors">Technology</a></li>
              <li><a href="/events?category=music" className="hover:text-brand-400 transition-colors">Music & Concerts</a></li>
              <li><a href="/events?category=business" className="hover:text-brand-400 transition-colors">Business & VC Summit</a></li>
              <li><a href="/events?category=workshops" className="hover:text-brand-400 transition-colors">Design Workshops</a></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">For Organizers</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/organizer/events/create" className="hover:text-brand-400 transition-colors">Host an Event</a></li>
              <li><a href="/organizer/dashboard" className="hover:text-brand-400 transition-colors">Organizer Studio</a></li>
              <li><a href="/login" className="hover:text-brand-400 transition-colors">Check-in Staff Login</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex gap-4 mb-4 text-slate-400">
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:text-white hover:bg-brand-600 transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:text-white hover:bg-brand-600 transition-all"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:text-white hover:bg-brand-600 transition-all"><Linkedin className="w-4 h-4" /></a>
            </div>
            <p className="text-xs text-slate-500">24/7 Ticketing Support & Verification</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EventFlow SaaS Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for creators and attendees.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
