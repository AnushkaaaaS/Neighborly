'use client';

import { useEffect, useState } from 'react';
import { Notebook } from "lucide-react";

import { Button } from '@/components/ui/button';
import { CalendarClock, MapPin, UserCircle, Filter, CheckCircle, XCircle, Trophy } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import RejectModal from '@/components/RejectModal';


export default function ProviderBookingsPage() {
  const [showRejectModal, setShowRejectModal] = useState(false);
const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const res = await fetch('/api/bookings/provider', {
        headers: {
          'x-user-id': user.id,
        },
      });

      const data = await res.json();
      setBookings(data);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try {
      const res = await fetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });

      if (!res.ok) throw new Error('Failed to update');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );

      if (status === 'CONFIRMED') {
        const syncRes = await fetch('/api/google/sync-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });

        if (!syncRes.ok) {
          console.warn('Booking saved, but calendar sync failed.');
        }
      }
    } catch  {
      alert("Booking confirmed, but failed to sync with Google Calendar.");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'ALL' || booking.status === filter;
    const matchesSearch = booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          booking.service.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
 


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Manage Bookings
          </h1>
          <p className="text-slate-400 mt-1">
            {bookings.length} total bookings • {filteredBookings.length} shown
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search bookings..."
              className="bg-slate-800 border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none bg-slate-800 border border-slate-700 text-white pl-10 pr-8 py-2 rounded-lg w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value as unknown)}
            >
              <option value="ALL">All Bookings</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
            <svg
              className="absolute right-2 top-3 h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-dashed border-slate-700">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CalendarClock className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-1">
            No bookings found
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {filter === 'ALL'
              ? 'You currently have no bookings. When clients book your services, they will appear here.'
              : `You have no ${filter.toLowerCase()} bookings at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-slate-600 transition-all duration-200 space-y-4"
            >
              {/* User */}
              <div className="flex items-center gap-3">
                {booking.user.avatarUrl ? (
                  <Image
                    src={booking.user.avatarUrl}
                    alt={booking.user.name}
                    width={48}
                    height={48}
                    className="rounded-full w-12 h-12 object-cover border-2 border-emerald-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-emerald-500/30 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{booking.user.name}</p>
                  <p className="text-xs text-slate-400">{booking.user.email}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-400">
                      {booking.service.title}
                    </h4>
                    <Badge variant="secondary" className="mt-1 bg-slate-700 text-slate-300">
                      {booking.service.category}
                    </Badge>
                  </div>
                  <Badge
                    className={`${
                      booking.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : booking.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : booking.status === 'COMPLETED'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {booking.status}
                  </Badge>
                </div>

                {/* Date & Location */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(booking.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{booking.address}</p>
                  </div>
                   <div className="flex items-start gap-3">
                    <Notebook className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{booking.userNotes}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                {booking.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                      onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </Button>
                   <Button
  variant="destructive"
  className="flex-1 gap-2"
  onClick={() => {
    setSelectedBookingId(booking.id);
    setShowRejectModal(true);
  }}
>
  <XCircle className="w-4 h-4" />
  Reject
</Button>

                  </div>
                )}

                {booking.status === 'CONFIRMED' && (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white gap-2"
                    onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                  >
                    <Trophy className="w-4 h-4" />
                    Mark as Completed
                  </Button>
                )}

                {booking.status === 'COMPLETED' && (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 px-4 py-2 rounded-full">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">Successfully Completed!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

{showRejectModal && selectedBookingId && (
  <RejectModal
    isOpen={showRejectModal}
    onClose={() => setShowRejectModal(false)}
    onConfirm={async (reason) => {
      try {
        const res = await fetch('/api/bookings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: selectedBookingId,
            status: 'REJECTED',
            rejectionReason: reason,
          }),
        });

        if (!res.ok) throw new Error('Failed to reject');
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBookingId
              ? { ...b, status: 'REJECTED', rejectionReason: reason }
              : b
          )
        );
      } catch (err) {
        alert('Failed to reject booking');
      } finally {
        setShowRejectModal(false);
        setSelectedBookingId(null);
      }
    }}
  />
)}

    </div>
  );
}