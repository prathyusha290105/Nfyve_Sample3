import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Appointment, RoomId, ROOMS, AppointmentStatus } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Filter, 
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RoomCalendarProps {
  onSelectAppointment?: (apt: Appointment) => void;
  onNewBookingForSlot?: (room: RoomId, timeSlot: string, date: string) => void;
  canManageBookings?: boolean;
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '12:00 PM - 01:00 PM',
  '02:30 PM - 03:30 PM',
  '04:00 PM - 05:00 PM',
  '05:30 PM - 06:30 PM'
];

export const RoomCalendar: React.FC<RoomCalendarProps> = ({
  onSelectAppointment,
  onNewBookingForSlot,
  canManageBookings = true
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomFilter, setRoomFilter] = useState<string>('all');

  const fetchAppointments = () => {
    setIsLoading(true);
    api.getAppointments({ date: selectedDate })
      .then(res => setAppointments(Array.isArray(res) ? res : []))
      .catch(err => console.error('Error fetching calendar appointments:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate('2026-10-02');
  };

  const filteredRooms = roomFilter === 'all' 
    ? ROOMS 
    : ROOMS.filter(r => r.id === roomFilter);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'checked_in':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'in_consultation':
      case 'in_progress':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'cancelled':
        return 'bg-rose-50 border-rose-200 text-rose-800 opacity-60';
      default:
        return 'bg-[#F0EEE5] border-[#DDD9CE] text-[#1E3B2E]';
    }
  };

  const handleQuickCheckIn = async (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation();
    try {
      await api.updateAppointmentStatus(apt.id, 'checked_in');
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to check in client.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-sm overflow-hidden flex flex-col">
      {/* Calendar Header Controls */}
      <div className="p-4 sm:p-6 border-b border-[#E7E5DC] flex flex-wrap items-center justify-between gap-4 bg-[#FAF9F5]">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#DDD9CE] rounded-lg p-1 shadow-2xs">
            <button 
              onClick={handlePrevDay} 
              className="p-1.5 hover:bg-[#F0EEE5] rounded text-[#585B53] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-[#1E3B2E] hover:bg-[#F0EEE5] rounded transition-colors"
            >
              Today
            </button>
            <button 
              onClick={handleNextDay} 
              className="p-1.5 hover:bg-[#F0EEE5] rounded text-[#585B53] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#1E3B2E]" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-[#252923] bg-white border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 shadow-2xs focus:outline-none focus:border-[#1E3B2E]"
            />
          </div>
        </div>

        {/* Room Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#777A70] font-medium hidden sm:inline">Room Resource:</span>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="bg-white border border-[#DDD9CE] text-[#252923] rounded-lg px-3 py-1.5 font-medium shadow-2xs focus:outline-none focus:border-[#1E3B2E]"
          >
            <option value="all">All 5 Resource Rooms</option>
            {ROOMS.map(r => (
              <option key={r.id} value={r.id}>{r.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#FAF9F5] border-b border-[#E7E5DC]">
              <th className="w-32 py-3 px-4 text-left text-[11px] font-semibold text-[#777A70] uppercase tracking-wider border-r border-[#E7E5DC]">
                Time Interval
              </th>
              {filteredRooms.map(room => (
                <th key={room.id} className="py-3 px-4 text-left border-r border-[#E7E5DC] last:border-r-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-serif text-sm font-semibold text-[#1E3B2E]">{room.name}</span>
                      <span className="block text-[10px] text-[#777A70] font-normal">{room.type.toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#585B53] border border-[#E7E5DC]">
                      Active
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className="border-b border-[#E7E5DC] hover:bg-[#FAF9F5]/40 transition-colors">
                {/* Time row label */}
                <td className="py-4 px-4 text-xs font-semibold text-[#585B53] border-r border-[#E7E5DC] bg-[#FAF9F5]/60 align-top tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1E3B2E]" />
                    <span>{slot.split(' - ')[0]}</span>
                  </div>
                  <span className="text-[10px] text-[#777A70] block pl-5">{slot.split(' - ')[1]}</span>
                </td>

                {/* Columns per room */}
                {filteredRooms.map((room) => {
                  const apt = appointments.find(a => 
                    a.timeSlot === slot && 
                    (a.room === room.id || (!a.room && room.id === 'Consult 1')) &&
                    a.status !== 'cancelled'
                  );

                  return (
                    <td key={room.id} className="p-2 border-r border-[#E7E5DC] last:border-r-0 align-top h-28">
                      {apt ? (
                        <div 
                          onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                          className={`p-3 rounded-xl border shadow-2xs cursor-pointer hover:shadow-md transition-all h-full flex flex-col justify-between ${getStatusColor(apt.status)}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs truncate max-w-[130px]">{apt.customerName}</span>
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-current">
                                {apt.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] truncate opacity-90">{apt.serviceName}</p>
                            <p className="text-[10px] opacity-75 flex items-center gap-1">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">{apt.assignedStaffName || apt.staffName}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                            <span className="opacity-70">{apt.bookingChannel || 'Phone'}</span>
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={(e) => handleQuickCheckIn(e, apt)}
                                className="px-2 py-0.5 bg-[#1E3B2E] text-white rounded font-semibold hover:bg-[#2A5140] transition-colors"
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => canManageBookings && onNewBookingForSlot && onNewBookingForSlot(room.id, slot, selectedDate)}
                          className="h-full min-h-[90px] rounded-xl border border-dashed border-[#DDD9CE] hover:border-[#1E3B2E] hover:bg-[#FAF9F5] p-2 flex flex-col items-center justify-center text-[#777A70] hover:text-[#1E3B2E] cursor-pointer transition-colors group"
                        >
                          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform mb-1 opacity-50 group-hover:opacity-100" />
                          <span className="text-[10px] font-medium">Available</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="p-4 bg-[#FAF9F5] border-t border-[#E7E5DC] flex flex-wrap items-center justify-between text-xs text-[#585B53] gap-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#1E3B2E]">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E3B2E]" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Checked In</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
        </div>
        <span className="text-[11px] text-[#777A70]">Showing 5 Scheduling Resources in Begumpet Sanctuary</span>
      </div>
    </div>
  );
};
