'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import eventService from '@/services/event.service';
import { selectUserRole } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { UserRole, IEvent } from '@/types';
import EventModal from '@/components/events/EventModal';
import { formatAppDate } from '@/lib/dateUtils';
import BaseButton from '@/components/ui/Buttons';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';


export default function EventsPage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const isAdmin = userRole === UserRole.Admin;

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  // Fetch events
  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: queryKeys.events.all(),
    queryFn: () => eventService.getAllEvents(),
  });

  const events: IEvent[] = eventsResponse?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
      dispatch(addToast({ type: 'success', message: 'Event deleted successfully' }));
    },
    onError: (error: any) => {
      dispatch(addToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete event' }));
    }
  });

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.info?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="page-title text-3xl font-bold text-[#002B5B]">Events Gallery</h1>
          <p className="text-sm text-gray-500 mt-1 italic">Capturing the highlights and celebrations of our team.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full sm:w-64 bg-gray-50/50"
            />
          </div>
          {isAdmin && (
            <BaseButton onClick={handleCreate} className="flex items-center gap-2 px-6">
              <Plus className="w-5 h-5" />
              New Event
            </BaseButton>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description={searchQuery ? "No events match your search criteria." : "There are no company events scheduled yet."}
          action={isAdmin && !searchQuery ? (
            <BaseButton onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add First Event
            </BaseButton>
          ) : undefined}
        />
      ) : (
        <div className="space-y-24">
          {filteredEvents.map((event) => (
            <section key={event._id} className="relative group">
              {/* Event Header */}
              <div className="flex flex-col items-center mb-10 px-4">
                <div className="relative inline-block">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-[#002B5B] mb-4 text-center tracking-tight leading-tight">
                    {event.name}
                  </h2>
                  {isAdmin && (
                    <div className="flex items-center gap-2 sm:absolute sm:-right-24 sm:top-2 mb-4 sm:mb-0 transition-all duration-300">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 bg-white shadow-xl rounded-full text-blue-600 hover:scale-110 transition-transform border border-blue-50"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 bg-white shadow-xl rounded-full text-red-600 hover:scale-110 transition-transform border border-red-50"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-500 max-w-2xl text-center leading-relaxed text-sm lg:text-base">
                  {event.info || 'A wonderful celebration captured in highlights.'}
                </p>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-brand-200" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">
                    {formatAppDate(event.createdAt)}
                  </span>
                  <div className="h-[1px] w-8 bg-brand-200" />
                </div>
              </div>

              {/* Event Gallery */}
              <div className="max-w-7xl mx-auto">
                {event.images && event.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    {event.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-700 hover:-translate-y-2 group/img relative border-8 border-white"
                      >
                        <img
                          src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || ''}${img}`}
                          alt={`${event.name} photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                    <CalendarDays className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium">No photos in this gallery yet</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Admin Modal */}
      <EventModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: queryKeys.events.all() })}
        event={selectedEvent}
      />
    </div>
  );
}
