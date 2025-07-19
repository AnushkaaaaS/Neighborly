'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Search, Phone, CalendarClock, UserCircle, LayoutDashboard,
  BookOpenCheck, MapPin, Settings, X
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@lib/supabase";
import { Button } from "@/components/ui/button";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [bookingModal, setBookingModal] = useState<any | null>(null);

  // Booking form fields
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        router.push("/login");
      } else {
        const name = data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User";
        setUserName(name);
        fetchServices();
      }
    });
  }, []);

  useEffect(() => {
    fetchServices();
  }, [searchTerm]);

  const fetchServices = async () => {
    try {
      const queryParams = new URLSearchParams({ location: searchTerm });
      const res = await fetch(`/api/services?${queryParams.toString()}`);
      const data = await res.json();
      setServices(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load services", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

const handleConfirmBooking = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("User not found");

    // ✅ Directly use Supabase UID as userId
    const scheduledAt = new Date(`${bookingDate}T${bookingTime}`);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id, // ← this works ONLY if it's same as your Prisma User.id
        serviceId: bookingModal.id,
        scheduledAt,
        address,
      }),
    });

    if (!res.ok) throw new Error("Booking failed");
    alert("Booking confirmed!");
    setBookingModal(null);
    setBookingDate("");
    setBookingTime("");
    setAddress("");
  } catch (err) {
    console.error(err);
    alert("Failed to confirm booking");
  }
};


  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-slate-800 p-4 md:p-6 flex flex-col justify-between fixed h-full z-40">
        <div>
          <h2 className="text-xl font-bold text-center md:text-left mb-10">Neighborly</h2>
          <nav className="space-y-4">
            {[{ name: "Dashboard", icon: <LayoutDashboard /> }, { name: "My Bookings", icon: <BookOpenCheck /> }, { name: "Nearby Services", icon: <MapPin /> }].map(({ name, icon }) => (
              <a key={name} href="#" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition">
                {icon}<span className="hidden md:inline">{name}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <a href="#" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white">
            <Settings className="w-5 h-5" /><span className="hidden md:inline">Settings</span>
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-red-400 hover:text-white transition">
            <LogOut className="w-5 h-5" /><span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 space-y-10 overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {userName} 👋</h1>
            <p className="text-sm text-gray-300">Find the best help around you.</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-slate-700">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow flex items-center gap-4">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search name, category, or location..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:bg-slate-700 transition flex flex-col items-center text-center"
            >
              {service.user?.avatarUrl ? (
                <Image
                  src={service.user.avatarUrl}
                  alt={service.title}
                  width={100}
                  height={100}
                  className="rounded-full object-cover border-4 border-white shadow w-24 h-24"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                  <UserCircle className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <p className="text-emerald-400 mt-2">By {service.user?.name || 'Provider'}</p>
              <h2 className="text-xl font-bold text-white mt-2">{service.title}</h2>
              <p className="text-gray-400 text-sm">{service.category}</p>
              <p className="text-sm text-slate-300 line-clamp-2">{service.description}</p>
              <div className="text-xs text-gray-400 mt-2">
                <CalendarClock className="inline w-4 h-4 mr-1" /> {service.availableDays?.join(', ')}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => setBookingModal(service)}
                >
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  className="text-sm px-4 py-2"
                  onClick={() => setSelectedService(service)}
                >
                  See Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* See Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-slate-900 text-white w-full max-w-4xl rounded-xl p-8 relative shadow-xl overflow-y-auto max-h-[90vh] border border-slate-700">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setSelectedService(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="shrink-0 flex flex-col items-center gap-2">
                {selectedService.user?.avatarUrl ? (
                  <Image
                    src={selectedService.user.avatarUrl}
                    alt={selectedService.title}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-emerald-500 shadow-md w-32 h-32 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center">
                    <UserCircle className="w-14 h-14 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{selectedService.user?.name}</h2>
                <p className="text-sm text-emerald-400 font-medium">{selectedService.title}</p>
                <p className="text-gray-300 text-sm italic">{selectedService.category}</p>

                {selectedService.user?.providerProfile?.bio && (
                  <div className="pt-3">
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">About</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedService.user.providerProfile.bio}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                  <p><strong>Contact:</strong> {selectedService.user?.phone}</p>
                  <p><strong>Location:</strong> {selectedService.location}</p>
                  <p><strong>Available Days:</strong> {selectedService.availableDays?.join(', ')}</p>
                  {selectedService.includesTools !== undefined && (
                    <p><strong>Includes Tools:</strong> {selectedService.includesTools ? 'Yes' : 'No'}</p>
                  )}
                  {selectedService.tags?.length > 0 && (
                    <p><strong>Tags:</strong> {selectedService.tags.join(', ')}</p>
                  )}
                  {selectedService.experienceYears && (
                    <p><strong>Experience:</strong> {selectedService.experienceYears} years</p>
                  )}
                  {selectedService.user?.providerProfile?.serviceTypes?.length > 0 && (
                    <p><strong>Services:</strong> {selectedService.user.providerProfile.serviceTypes.join(', ')}</p>
                  )}
                </div>

                <div className="pt-6">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => {
                      setBookingModal(selectedService);
                      setSelectedService(null);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Now Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-2xl relative text-white border border-emerald-700 shadow-lg max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setBookingModal(null)}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{bookingModal.title}</h2>
            <p className="text-emerald-400 mb-2">By {bookingModal.user?.name}</p>
            <p className="text-sm mb-4">{bookingModal.description}</p>
            <p className="text-sm mb-2"><strong>Price:</strong> ₹{bookingModal.price}</p>
            <p className="text-sm mb-6"><strong>Experience:</strong> {bookingModal.experienceYears} years</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Select Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-slate-800 rounded px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Select Time</label>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full bg-slate-800 rounded px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full bg-slate-800 rounded px-4 py-2" placeholder="Enter address for service..." />
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={handleConfirmBooking}>
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
