'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarClock, UserCircle, X, LogOut, MapPin, Clock, DollarSign, Info, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Wrench } from "lucide-react";


import { supabase } from "@lib/supabase";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import { startOfDay, isBefore, addMinutes, format } from "date-fns";
import "react-day-picker/dist/style.css";


export function getAllowedDaysIndexes(days: string[]): number[] {
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return days
    .map((day) => dayMap[day.trim()])
    .filter((dayIndex) => dayIndex !== undefined);
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [bookingModal, setBookingModal] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

    useEffect(() => {
    if (showBookingSuccess) {
      const timeout = setTimeout(() => {
        router.push('/user/my-bookings');
      }, 2000); // Wait 2 seconds before redirect

      return () => clearTimeout(timeout);
    }
  }, [showBookingSuccess]);

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setCalendarToken(token);
    }
  }, []);

  useEffect(() => {
    if (!selectedServiceId || !bookingDate) return;

    const fetchOccupied = async () => {
      const res = await fetch(
        `/api/bookings/occupied-slots?serviceId=${selectedServiceId}&date=${format(bookingDate, "yyyy-MM-dd")}`
      );
      const json = await res.json();
      setOccupiedSlots(json.occupied || []);
    };

    fetchOccupied();
  }, [selectedServiceId, bookingDate]);

  useEffect(() => {
    if (bookingModal) {
      setSelectedServiceId(bookingModal.id);
    } else {
      setSelectedServiceId(null);
    }
  }, [bookingModal]);

  const handleFindNearbyServices = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      try {
        const res = await fetch(`/api/services/nearby?lat=${userLat}&lng=${userLng}`);
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch nearby services", error);
      }
    }, () => {
      alert("Unable to retrieve your location.");
    });
  };

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

  const generateTimeSlots = (interval = 30, from = "09:00", to = "18:00"): string[] => {
    const slots: string[] = [];
    const [fromH, fromM] = from.split(":").map(Number);
    const [toH, toM] = to.split(":").map(Number);
    const start = new Date();
    start.setHours(fromH, fromM, 0, 0);
    const end = new Date();
    end.setHours(toH, toM, 0, 0);

    let current = new Date(start);
    while (current <= end) {
      slots.push(format(current, "HH:mm:ss"));
      current = addMinutes(current, interval);
    }
    return slots;
  };



  const handleConfirmBooking = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) throw new Error("User not found");
      if (!bookingDate || !bookingTime) throw new Error("Please select date and time");
      if (occupiedSlots.includes(bookingTime)) {
        alert("This time slot is already booked. Please choose another.");
        return;
      }

      const [hours, minutes] = bookingTime.split(":").map(Number);
      const scheduledAt = new Date(bookingDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          serviceId: bookingModal.id,
          scheduledAt,
          address,
          userNotes,
        }),
      });
      if (!res.ok) throw new Error("Booking failed");

      if (calendarToken) {
        await fetch("/api/add-calendar-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: calendarToken,
            title: bookingModal.title,
            start: scheduledAt,
            description: bookingModal.description,
            location: address,
          }),
        });
      }

      setShowBookingSuccess(true);
      setTimeout(() => {
        setShowBookingSuccess(false);
        setBookingModal(null);
        setBookingDate(undefined);
        setBookingTime("");
        setAddress("");
        setUserNotes("");
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Neighborly Services</h1>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="text-white border-white hover:bg-slate-700 text-sm md:text-base"
        >
          <LogOut className="w-4 h-4 mr-1 md:mr-2" /> 
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName} 👋</h1>
        <p className="text-xs md:text-sm text-emerald-100 mt-1">Find trusted local professionals for all your needs</p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800 rounded-lg md:rounded-xl p-3 md:p-4 shadow flex items-center gap-3 mb-6 md:mb-8">
        <div className="relative flex-1 flex items-center">
          <Search className="text-gray-400 w-4 h-4 md:w-5 md:h-5 absolute left-3" />
          <input
            type="text"
            placeholder="Search services, categories, or locations..."
            className="w-full bg-slate-700 text-white placeholder-gray-400 focus:outline-none rounded-lg pl-10 pr-3 py-2 text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-500 text-xs md:text-sm px-3 md:px-4"
          onClick={handleFindNearbyServices}
        >
          <MapPin className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Near Me</span>
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="w-12 h-12 text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No services found</h3>
          <p className="text-gray-400 max-w-md">Try adjusting your search or browse nearby services</p>
          <Button className="mt-4 bg-emerald-600 hover:bg-emerald-500" onClick={handleFindNearbyServices}>
            Find Nearby Services
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg hover:bg-slate-700 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                {service.user?.avatarUrl ? (
                  <Image
                    src={service.user.avatarUrl}
                    alt={service.title}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-emerald-500 shadow w-12 h-12"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-emerald-400 text-sm font-medium">By {service.user?.name || 'Provider'}</p>
                  <h2 className="text-lg font-bold text-white">{service.title}</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <MapPin className="w-3 h-3" />
                <span>{service.location}</span>
              </div>
              
              <p className="text-sm text-slate-300 mb-4 line-clamp-2">{service.description}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                    {service.isCustomPricing ? (
                      <span>From ₹{service.startingFromPrice}</span>
                    ) : (
                        <span className="block text-xs text-gray-400 mt-1">
                           ₹ {service.basePrice}
                          </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{service.availableDays?.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    className="text-xs md:text-sm px-3 py-1 h-8 bg-emerald-600 hover:bg-emerald-500 flex-1"
                    onClick={() => setBookingModal(service)}
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs md:text-sm px-3 py-1 h-8 flex-1"
                    onClick={() => setSelectedService(service)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6">
          <div className="bg-slate-900 text-white w-full max-w-2xl rounded-xl p-5 md:p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] border border-emerald-700/50">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
              onClick={() => setSelectedService(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="shrink-0 flex flex-col items-center">
                {selectedService.user?.avatarUrl ? (
                  <Image
                    src={selectedService.user.avatarUrl}
                    alt={selectedService.title}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-emerald-500 shadow-lg w-24 h-24 sm:w-32 sm:h-32 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                    <UserCircle className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-bold mt-3 text-center">{selectedService.user?.name}</h3>
                <p className="text-emerald-400 text-sm text-center">{selectedService.category}</p>
                
                <div className="mt-4 w-full">
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-300">Price</p>

                    <p className="text-xl font-bold text-emerald-400">
                      {selectedService.isCustomPricing ? (
                        <>₹{selectedService.startingFromPrice}+   <span className="block text-xs text-gray-400 mt-1">
                            Final price on visit
                          </span></>
                      ) : (
                        <>₹{selectedService.basePrice} / hr</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{selectedService.title}</h2>
                  <p className="text-sm text-slate-300 mt-1">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-slate-300">{selectedService.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Availability</p>
                      <p className="text-slate-300">{selectedService.availableDays?.join(', ')}</p>
                    </div>
                  </div>
                  
                  {selectedService.experienceYears && (
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 mt-0.5 text-emerald-400" />
                      <div>
                        <p className="font-semibold">Experience</p>
                        <p className="text-slate-300">{selectedService.experienceYears} years</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedService.includesTools !== undefined && (
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 mt-0.5 text-emerald-400" />
                      <div>
                        <p className="font-semibold">Tools Provided</p>
                        <p className="text-slate-300">{selectedService.includesTools ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedService.user?.providerProfile?.bio && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">About the Provider</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedService.user.providerProfile.bio}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => {
                      setBookingModal(selectedService);
                      setSelectedService(null);
                    }}
                  >
                    Book This Service
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (() => {
        const allowedDays = getAllowedDaysIndexes(bookingModal.availableDays || []);
        const isDateAllowed = (date: Date) => {
          const today = startOfDay(new Date());
          return allowedDays.includes(date.getDay()) && !isBefore(date, today);
        };

        let timeSlots: string[] = [];
        if (bookingDate) {
          const dayName = bookingDate.toLocaleDateString("en-US", { weekday: "short" });
          const daySlots = bookingModal.availableTime?.filter((s: string) => s.startsWith(dayName));
          
          daySlots?.forEach((slot: string) => {
            const [_, times] = slot.split(/:(.+)/);
            const [from, to] = times.split("-");
            if (from && to) {
              const allSlots = generateTimeSlots(bookingModal.durationMinutes || 30, from, to);
              timeSlots.push(...allSlots.filter(slot => !occupiedSlots.includes(slot)));
            }
          });
        }

        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-slate-900 p-5 md:p-6 rounded-xl w-full max-w-md relative text-white border border-emerald-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
                onClick={() => setBookingModal(null)}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-start gap-3 mb-5">
                {bookingModal.user?.avatarUrl ? (
                  <Image
                    src={bookingModal.user.avatarUrl}
                    alt={bookingModal.title}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-emerald-500 w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{bookingModal.title}</h2>
                  <p className="text-emerald-400 text-sm">By {bookingModal.user?.name}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Pricing Summary */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Service Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Price</span>
                    <span className="font-bold text-emerald-400">
                      {bookingModal.isCustomPricing ? (
                        `From ₹${bookingModal.startingFromPrice}`
                      ) : (
                        `₹${bookingModal.basePrice}`
                      )}
                    </span>
                    
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <DayPicker
                      mode="single"
                      selected={bookingDate}
                      onSelect={(date) => date && isDateAllowed(date) && setBookingDate(date)}
                      disabled={(date) => !isDateAllowed(date)}
                      fromDate={new Date()}
                      modifiersClassNames={{
                        selected: 'bg-emerald-600 text-white rounded-full',
                        disabled: 'opacity-30 pointer-events-none',
                        today: 'border border-emerald-500',
                      }}
                      styles={{
                        day: {
                          margin: '0.1rem',
                          transition: 'all 0.2s',
                        },
                      }}
                    />
                  </div>
                  {bookingDate && (
                    <p className="text-sm text-emerald-400 mt-2">
                      Selected: {format(bookingDate, "EEEE, MMMM do")}
                    </p>
                  )}
                </div>

                {/* Time Slot Picker */}
                {bookingDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                    {timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((slot, index) => {
                          const [hours, minutes] = slot.split(":").map(Number);
                          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                          return (
                            <button
                              key={index}
                              onClick={() => setBookingTime(slot)}
                              className={`py-2 rounded-md text-sm transition ${bookingTime === slot 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-800 hover:bg-slate-700'}`}
                            >
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center text-sm text-gray-400">
                        No available time slots for this date
                      </div>
                    )}
                  </div>
                )}

                {/* Address Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Service Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter your address"
                  />
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Special Instructions</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Specify your needs and what you expect from the provider"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 py-3" 
                    onClick={handleConfirmBooking}
                    disabled={!bookingDate || !bookingTime || !address}
                  >
                    Request Booking
                  </Button>

              
                    
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Booking Success Toast */}
      {showBookingSuccess && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span>Booking request sent! We will reach out to you if there is a update</span>
        </div>
      )}
    </div>
  );
}