'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, UserCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@lib/supabase';

type Booking = {
  id: string;
  address: string;
  scheduledAt: string;
  rejectionReason?: string;
  status: string;
  service: {
    id: string;
    title: string;
    category: string;
    user: {
      name: string;
      email: string;
      avatarUrl?: string;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<Record<string, { rating: number; comment: string }>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Existing data fetching logic
  useEffect(() => {
    const fetchUserBookings = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      setUserId(user.id);
      const res = await fetch(`/api/bookings/user?uid=${user.id}`);
      const data = await res.json();
      setBookings(data);
      setLoading(false);
    };

    fetchUserBookings();
  }, []);

  // Existing review handlers
  const handleReviewChange = (bookingId: string, field: 'rating' | 'comment', value: any) => {
    setReviewData(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
  };

  const submitReview = async (bookingId: string, serviceId: string) => {
    const data = reviewData[bookingId];
    if (!data?.rating || !data?.comment) return;

    setSubmitting(bookingId);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        bookingId,
        serviceId,
        rating: data.rating,
        comment: data.comment,
      }),
    });

    if (res.ok) {
      const updated = bookings.map(b =>
        b.id === bookingId
          ? {
              ...b,
              review: { id: 'new', ...data },
            }
          : b
      );
      setBookings(updated);
      setReviewData(prev => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });
    }
    setSubmitting(null);
  };

  if (loading) return (
    <div className="p-6 text-white">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700 rounded w-64 mb-6"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">You haven't booked any services yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {booking.service.user.avatarUrl ? (
                      <Image
                        src={booking.service.user.avatarUrl}
                        alt={booking.service.user.name}
                        width={48}
                        height={48}
                        className="rounded-full w-12 h-12 object-cover border-2 border-emerald-500"
                      />
                    ) : (
                      <UserCircle className="w-12 h-12 text-gray-400" />
                    )}
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                      booking.status === 'PENDING' ? 'bg-yellow-500' :
                      booking.status === 'CONFIRMED' ? 'bg-green-500' :
                      booking.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{booking.service.title}</h2>
                    <p className="text-emerald-400 text-sm">{booking.service.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  booking.status === 'PENDING' ? 'bg-yellow-600/20 text-yellow-300' :
                  booking.status === 'CONFIRMED' ? 'bg-green-600/20 text-green-300' :
                  booking.status === 'COMPLETED' ? 'bg-blue-600/20 text-blue-300' :
                  'bg-red-600/20 text-red-300'
                }`}>
                  {booking.status}
                </span>
              </div>

              {/* Details Section */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(booking.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                    <span>{booking.address}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Provider: </span>
                    <span>{booking.service.user.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Email: </span>
                    <span>{booking.service.user.email}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {booking.status === 'REJECTED' && booking.rejectionReason && (
                <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                  <p className="text-sm text-red-300">
                    <span className="font-medium">Reason: </span>
                    {booking.rejectionReason}
                  </p>
                </div>
              )}

              {/* Review Section */}
              {booking.status === 'COMPLETED' && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <h3 className="font-medium mb-3">Your Review</h3>
                  {booking.review ? (
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < booking.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm italic">"{booking.review.comment}"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleReviewChange(booking.id, 'rating', val)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                reviewData[booking.id]?.rating >= val
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={3}
                        className="w-full bg-slate-700 text-white rounded-lg p-3 text-sm border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                        placeholder="Share your experience..."
                        value={reviewData[booking.id]?.comment || ''}
                        onChange={(e) => handleReviewChange(booking.id, 'comment', e.target.value)}
                      />
                      <button
                        className="bg-emerald-600 hover:bg-emerald-700 text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                        onClick={() => submitReview(booking.id, booking.service.id)}
                        disabled={submitting === booking.id || !reviewData[booking.id]?.rating || !reviewData[booking.id]?.comment}
                      >
                        {submitting === booking.id ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}