'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { Star, Calendar, User, MessageSquare, Frown, Meh, Smile, Laugh } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      try {
        const res = await fetch(`/api/reviews/provider?uid=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        
        const data = await res.json();
        setReviews(data);
        
        // Calculate average rating
        if (data.length > 0) {
          const avg = data.reduce((sum: number, review: unknown) => sum + review.rating, 0) / data.length;
          setAverageRating(parseFloat(avg.toFixed(1)));
        }
        
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getRatingEmoji = (rating: number) => {
    if (rating <= 2) return <Frown className="w-5 h-5 text-red-400" />;
    if (rating <= 3) return <Meh className="w-5 h-5 text-yellow-400" />;
    if (rating <= 4) return <Smile className="w-5 h-5 text-lime-400" />;
    return <Laugh className="w-5 h-5 text-green-400" />;
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Your Reviews
            </h1>
            <p className="text-slate-400 mt-2">
              Feedback from your fellow neighbours
              
            </p>
          </div>
          
          {reviews.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{averageRating}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border-2 border-slate-800">
                  {getRatingEmoji(averageRating)}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Average Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-dashed border-slate-700">
            <div className="mx-auto w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              When clients leave reviews for your services, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-800/50 hover:bg-slate-800/70 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-slate-600 transition-all duration-200 space-y-4"
              >
                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  {review.user?.avatarUrl ? (
                    <Image
                      src={review.user.avatarUrl}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="rounded-full w-12 h-12 object-cover border-2 border-emerald-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-emerald-500/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-emerald-400">
                    {review.booking?.service?.title || 'Service'}
                  </p>
                </div>

                {/* Review Content */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      {review.comment || 'No comment provided'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-500">
                    <Calendar className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}