// app/provider/dashboard/page.tsx
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { Sparkles, Smile, CalendarDays, Wallet, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [profileComplete, setProfileComplete] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    upcomingCount: 0,
    completedCount: 0,
    earnings: 0,
    rating: 0,
  });
  const [showBanner, setShowBanner] = useState(true);
  const [services, setServices] = useState([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;

      const id = session.user.id;
      setUserId(id);

      const name = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Provider";
      setUserName(name);

      const requiredFields = ["name", "phone", "location"];
      const missingFields = requiredFields.filter(field => !session.user.user_metadata?.[field]);
      setProfileComplete(missingFields.length === 0);

      // Google connection
      const res = await fetch("/api/google-auth/status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const { connected } = await res.json();
      setIsGoogleConnected(connected);

      // Fetch services
      const serviceRes = await fetch(`/api/provider/services?userId=${id}`);
      const serviceData = await serviceRes.json();
      setServices(serviceData);

      // Fetch bookings
      const bookingsRes = await fetch(`/api/provider/bookings?userId=${id}&status=confirmed`);
      const bookingsData = await bookingsRes.json();
      const sortedBookings = bookingsData
        .filter(b => new Date(b.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

      setBookings(bookingsData);
      setNextBooking(sortedBookings[0] || null);

      const reviewsRes = await fetch("/api/provider/reviews", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData);

      const statsRes = await fetch(`/api/provider/stats?userId=${id}`);
      const statsData = await statsRes.json();
      setStats(statsData);
    });
  }, []);

  const chartOptions = {
    chart: { 
      type: 'area', 
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
    },
    dataLabels: { enabled: false },
    stroke: { 
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    grid: {
      show: false,
    },
    xaxis: { 
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      labels: {
        style: {
          colors: '#9CA3AF',
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9CA3AF',
        },
        formatter: (value: number) => `₹${value}`
      }
    },
    colors: ['#4F46E5'],
    tooltip: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      y: {
        formatter: (value: number) => `₹${value}`
      }
    }
  };

  const chartSeries = [{ name: "Earnings", data: [3000, 4200, 2800, 5000] }];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {!profileComplete && showBanner && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <div>
              <strong className="font-semibold">Complete your profile!</strong>{" "}
              Some info is missing from your account.{" "}
              <a href="/provider/profile" className="underline ml-1 font-medium">Update now</a>
            </div>
          </div>
          <button 
            onClick={() => setShowBanner(false)} 
            className="p-1 rounded-full hover:bg-yellow-700/30 transition-colors"
            aria-label="Close banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {userName} 👋</h1>
          <p className="text-sm text-blue-100 max-w-lg">
            Manage bookings, earnings, reviews, and chat — all from one place.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-yellow-200 text-sm flex items-center gap-1.5 bg-blue-700/30 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4" /> 
              <span>Tip: Keep your chat active to improve trust</span>
            </p>
            {isGoogleConnected ? (
              <p className="text-green-200 text-sm flex items-center gap-1.5 bg-blue-700/30 px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Google Calendar Connected</span>
              </p>
            ) : (
              <Button
                className="text-xs sm:text-sm h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                onClick={() => window.location.href = "/api/google-auth/initiate"}
              >
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Smile className="text-white w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat 
          icon={<CalendarDays className="text-blue-400 w-5 h-5" />} 
          title="Upcoming" 
          value={stats.upcomingCount} 
          trend={stats.upcomingCount > 0 ? 'up' : 'neutral'}
        />
        <Stat 
          icon={<Wallet className="text-green-400 w-5 h-5" />} 
          title="Earnings" 
          value={`₹${stats.earnings.toLocaleString('en-IN')}`} 
          trend="up"
        />
        <Stat 
          icon={<Star className="text-yellow-400 w-5 h-5" />} 
          title="Rating" 
          value={stats.rating.toFixed(1)} 
          trend={stats.rating > 4 ? 'up' : stats.rating < 3 ? 'down' : 'neutral'}
        />
        <Stat 
          icon={<CalendarDays className="text-pink-400 w-5 h-5" />} 
          title="Next Booking" 
          value={
            nextBooking
              ? new Date(nextBooking.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
                ", " +
                new Date(nextBooking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—"
          } 
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Upcoming Bookings" className="lg:col-span-2" action={
          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
            View All
          </Button>
        }>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No upcoming bookings</div>
                <Button variant="outline" size="sm">Create Availability</Button>
              </div>
            ) : (
              bookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 p-2 rounded-lg">
                      <CalendarDays className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{booking.user.name}</div>
                      <div className="text-sm text-gray-400">
                        {booking.service.title} • {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-gray-600 hover:border-indigo-400"
                  >
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Your Services" action={
          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
            Manage
          </Button>
        }>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No services added</div>
              <Button variant="outline" size="sm">Add Service</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{service.title}</div>
                    <div className="text-sm text-gray-400">
                      ₹{service.basePrice}/hour • <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Latest Reviews" action={
          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
            See All
          </Button>
        }>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No reviews yet</div>
              <Button variant="outline" size="sm">Request Reviews</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 2).map((booking) => (
                <div key={booking.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">{booking.user.name}</div>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{booking.review?.rating ?? "N/A"}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    &quot;{booking.review?.comment || "No comment provided"}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Earnings Overview" className="lg:col-span-2" action={
          <div className="flex gap-1 text-sm">
            <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
              Week
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
              Month
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
              Year
            </Button>
          </div>
        }>
          <div className="h-[250px]">
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height="100%"
              width="100%"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children, className = "", action }) {
  return (
    <div className={`bg-slate-800/50 rounded-xl p-5 shadow-lg border border-slate-700/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Stat({ title, value, icon, trend = 'neutral' }) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };
  
  const trendIcons = {
    up: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    ),
    neutral: null
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 shadow-lg border border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-gray-400 flex items-center gap-1.5">
          {icon} {title}
        </div>
        {trend !== 'neutral' && (
          <span className={`text-xs flex items-center gap-0.5 ${trendColors[trend]}`}>
            {trendIcons[trend]} {trend === 'up' ? '5%' : trend === 'down' ? '2%' : ''}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}