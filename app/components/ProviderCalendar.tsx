'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '@lib/supabase';
import * as Dialog from '@radix-ui/react-dialog';
import { CheckCircle, X, Clock, MapPin, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const localizer = momentLocalizer(moment);

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userName: string;
  serviceTitle: string;
  address: string;
  status: 'CONFIRMED' | 'COMPLETED';
};

export default function ProviderCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw new Error('No Supabase session');

        const res = await fetch('/api/bookings/calendar', {
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to fetch bookings');

        const mappedEvents = result.bookings
          .filter((booking: any) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')
          .map((booking: any) => {
            const start = new Date(booking.scheduledAt);
            const end = new Date(start.getTime() + booking.durationMinutes * 60000);

            return {
              id: booking.id,
              title: `${booking.userName} - ${booking.serviceTitle}`,
              start,
              end,
              userName: booking.userName,
              serviceTitle: booking.serviceTitle,
              address: booking.address,
              status: booking.status,
            };
          });

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const isCompleted = event.status === 'COMPLETED';
    return {
      style: {
        backgroundColor: isCompleted ? '#10b981' : '#6366f1',
        color: 'white',
        borderRadius: '4px',
        padding: '2px 4px',
        border: 'none',
        fontWeight: 500,
        fontSize: '0.75rem',
        lineHeight: 1.2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        opacity: isCompleted ? 0.9 : 1,
        boxShadow: isCompleted ? '0 1px 2px rgba(16, 185, 129, 0.2)' : '0 1px 2px rgba(99, 102, 241, 0.2)',
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="w-full h-full overflow-hidden p-1">
      <div className="font-medium truncate flex items-center gap-1">
        {event.status === 'COMPLETED' ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {event.userName}
      </div>
      <div className="text-xs truncate">{event.serviceTitle}</div>
    </div>
  );

  const dayPropGetter = (date: Date) => {
    const isToday = moment(date).isSame(moment(), 'day');
    return {
      style: {
        backgroundColor: isToday ? 'rgba(253, 224, 71, 0.1)' : 'transparent',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
      },
    };
  };

  const messages = {
    today: 'Today',
    previous: <ChevronLeft className="w-4 h-4" />,
    next: <ChevronRight className="w-4 h-4" />,
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    noEventsInRange: 'No appointments scheduled for this period.',
    showMore: (count: number) => `+${count} more`,
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md border dark:border-zinc-800 max-w-6xl mx-auto mt-4 sm:mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-white">
            Appointment Calendar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {events.length > 0
              ? `${events.filter(e => e.status === 'CONFIRMED').length} upcoming • ${events.filter(e => e.status === 'COMPLETED').length} completed`
              : 'No appointments scheduled yet'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentView === Views.MONTH ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.MONTH)}
            className="h-8 px-3"
          >
            Month
          </Button>
          <Button
            variant={currentView === Views.WEEK ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.WEEK)}
            className="h-8 px-3"
          >
            Week
          </Button>
          <Button
            variant={currentView === Views.DAY ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.DAY)}
            className="h-8 px-3"
          >
            Day
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 sm:h-96 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading appointments...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            dayPropGetter={dayPropGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            view={currentView}
            onView={setCurrentView}
            onNavigate={handleNavigate}
            date={currentDate}
            messages={messages}
            popup
            tooltipAccessor={() => null}
          />
        </div>
      )}

      <Dialog.Root open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 rounded-lg sm:rounded-xl shadow-lg border dark:border-zinc-700 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-white">
                  Appointment Details
                </Dialog.Title>
                <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEvent?.status === 'COMPLETED' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
                }`}>
                  {selectedEvent?.status === 'COMPLETED' ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      Confirmed
                    </>
                  )}
                </div>
              </div>
              <Dialog.Close asChild>
                <button 
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Client</p>
                  <p className="text-sm sm:text-base text-zinc-800 dark:text-white">{selectedEvent?.userName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Service</p>
                  <p className="text-sm sm:text-base text-zinc-800 dark:text-white">{selectedEvent?.serviceTitle}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Date & Time</p>
                  <p className="text-sm sm:text-base text-zinc-800 dark:text-white">
                    {moment(selectedEvent?.start).format('ddd, MMM D, YYYY')}
                    <br />
                    {moment(selectedEvent?.start).format('h:mm A')} - {moment(selectedEvent?.end).format('h:mm A')}
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      ({Math.round(((selectedEvent?.end?.getTime() - selectedEvent?.start?.getTime()) / 60000))} mins)
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                  <p className="text-sm sm:text-base text-zinc-800 dark:text-white">{selectedEvent?.address}</p>
                </div>
              </div>

              {selectedEvent?.status === 'COMPLETED' && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <p className="font-medium">This appointment was successfully completed</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end">
              <Dialog.Close asChild>
                <Button variant="default" size="sm" className="px-4">
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}