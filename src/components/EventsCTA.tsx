/**
 * EventsCTA — pulls live & upcoming events from the Supabase `events` table.
 *
 * To create the table, run this SQL in your Supabase dashboard (SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS events (
 *     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     event_name text NOT NULL,
 *     city text NOT NULL DEFAULT 'Memphis, TN',
 *     start_date date,
 *     end_date date,
 *     status text NOT NULL DEFAULT 'upcoming',
 *     live_now boolean NOT NULL DEFAULT false,
 *     banner_text text,
 *     featured_image_url text,
 *     created_at timestamptz DEFAULT now()
 *   );
 *   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Public can read active events"
 *     ON events FOR SELECT TO anon, authenticated
 *     USING (status IN ('live', 'upcoming'));
 *   INSERT INTO events (event_name, city, start_date, end_date, status, live_now, banner_text) VALUES
 *     ('NXTPro Session 7', 'Memphis, TN', CURRENT_DATE, CURRENT_DATE + 1, 'live', true, 'LIVE NOW: NXTPro Session 7 – Memphis, TN'),
 *     ('Spring Showcase Tournament', 'Memphis, TN', '2026-06-07', '2026-06-08', 'upcoming', false, 'Basketball · Spring Showcase Tournament'),
 *     ('7-on-7 Summer League', 'Memphis, TN', '2026-07-12', '2026-07-13', 'upcoming', false, 'Football · 7-on-7 Summer League'),
 *     ('Regional Championships', 'Memphis, TN', '2026-08-02', '2026-08-03', 'upcoming', false, 'Track & Field · Regional Championships');
 */

import { Trophy, MapPin, Calendar, ArrowRight, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  event_name: string;
  city: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  live_now: boolean;
  banner_text: string | null;
}

const STATIC_EVENTS: Event[] = [
  {
    id: 'static-1',
    event_name: 'NXTPro Session 7',
    city: 'Memphis, TN',
    start_date: null,
    end_date: null,
    status: 'live',
    live_now: true,
    banner_text: null,
  },
  {
    id: 'static-2',
    event_name: 'Spring Showcase Tournament',
    city: 'Memphis, TN',
    start_date: '2026-06-07',
    end_date: '2026-06-08',
    status: 'upcoming',
    live_now: false,
    banner_text: null,
  },
  {
    id: 'static-3',
    event_name: '7-on-7 Summer League',
    city: 'Memphis, TN',
    start_date: '2026-07-12',
    end_date: '2026-07-13',
    status: 'upcoming',
    live_now: false,
    banner_text: null,
  },
];

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Coming Soon';
  const s = new Date(start + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (!end || end === start) return s.toLocaleDateString('en-US', opts);
  const e = new Date(end + 'T00:00:00');
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
}

interface EventsCTAProps {
  onNavigate?: (page: string) => void;
}

export default function EventsCTA({ onNavigate }: EventsCTAProps) {
  const [events, setEvents] = useState<Event[]>(STATIC_EVENTS);

  useEffect(() => {
    supabase
      .from('events')
      .select('id, event_name, city, start_date, end_date, status, live_now, banner_text')
      .in('status', ['live', 'upcoming'])
      .order('live_now', { ascending: false })
      .order('start_date', { ascending: true })
      .limit(6)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setEvents(data as Event[]);
      });
  }, []);

  const liveEvent = events.find((e) => e.live_now);
  const upcomingEvents = events.filter((e) => !e.live_now).slice(0, 3);

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — sticky heading */}
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 bg-navy/10 border border-navy/20 text-navy px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Trophy className="w-3.5 h-3.5" />
              Events
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-navy leading-tight mb-6">
              From Tournaments<br />
              <span className="text-gold-dark">to Opportunity</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              We capture athletes live at games and events, turning real moments into lasting opportunities. One game-changing play, one story told right — that's how careers begin.
            </p>
            <button
              onClick={() => onNavigate?.('create')}
              className="btn-primary px-8 py-4 text-base font-bold inline-flex items-center gap-2 group"
            >
              Create Free Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Right — events list */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-navy font-bold text-sm uppercase tracking-wider">Live &amp; Upcoming</p>
              {liveEvent && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <Radio className="w-3 h-3" />
                  Live Now
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Live event card */}
              {liveEvent && (
                <div className="bg-navy border-2 border-amber-500 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-navy text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                    Live Now
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <p className="font-black text-white text-lg leading-snug mb-1">{liveEvent.event_name}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {liveEvent.city}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          In Progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming event cards */}
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gold/40 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy text-base leading-snug mb-2">{event.event_name}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.city}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        Spots open
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Events added as they're confirmed.{' '}
              <button
                onClick={() => onNavigate?.('create')}
                className="text-gold hover:text-gold-dark font-semibold transition-colors"
              >
                Register your athlete
              </button>
              {' '}to be notified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
