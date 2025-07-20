import React from 'react';
import { Calendar, Clock, Users, Building } from 'lucide-react';
import { hallHireBookingService } from '../data/hallHireBookings';
import { hallHirePackages } from '../data/hallHire';

interface HallHireScheduleProps {
  selectedDate?: string;
}

const HallHireSchedule: React.FC<HallHireScheduleProps> = ({ selectedDate }) => {
  const bookings = selectedDate 
    ? hallHireBookingService.getBookingsForDate(selectedDate)
    : hallHireBookingService.getAllBookings();

  if (bookings.length === 0) {
    return null;
  }

  const getPackageName = (packageId: string) => {
    const pkg = hallHirePackages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Unknown Package';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Building className="w-5 h-5 mr-2" />
        Hall Hire Bookings
      </h3>
      <div className="space-y-3">
        {bookings.map(booking => (
          <div
            key={booking.id}
            className="bg-white border rounded-lg p-3 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="font-medium text-gray-800">
                {getPackageName(booking.packageId)} - {booking.eventType}
              </div>
              <div className="text-gray-600">
                <Users className="w-3 h-3 inline mr-1" />
                {booking.expectedAttendees} people
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Customer:</span> {booking.customerName}
              </div>
              {booking.specialRequirements && (
                <div className="text-gray-600 text-xs">
                  <span className="font-medium">Notes:</span> {booking.specialRequirements}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallHireSchedule; 