import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Mail, Phone, User, FileText, AlertTriangle } from 'lucide-react';
import { HallHirePackage } from '../data/hallHire';
import { hallHireService } from '../services/hallHireService';
import { hallHireBookingService } from '../data/hallHireBookings';

interface HallBookingFormProps {
  selectedPackage: HallHirePackage;
  onClose: () => void;
}

const HallBookingForm: React.FC<HallBookingFormProps> = ({ selectedPackage, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    eventType: '',
    specialRequirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear availability error when user changes date or time
    if (['eventDate', 'startTime', 'endTime'].includes(name)) {
      setAvailabilityError(null);
    }
  };

  // Check availability when date or time changes
  useEffect(() => {
    if (formData.eventDate && formData.startTime && formData.endTime) {
      const isAvailable = hallHireBookingService.isTimeSlotAvailable(
        formData.eventDate,
        formData.startTime,
        formData.endTime
      );
      
      if (!isAvailable) {
        setAvailabilityError('This time slot is not available. Please select a different time or date.');
      } else {
        setAvailabilityError(null);
      }
    }
  }, [formData.eventDate, formData.startTime, formData.endTime]);

  const calculateTotalPrice = () => {
    if (selectedPackage.id === 'hourly') {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return Math.ceil(hours) * selectedPackage.price;
    }
    return selectedPackage.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookingData = {
        packageId: selectedPackage.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedAttendees: parseInt(formData.expectedAttendees),
        eventType: formData.eventType,
        specialRequirements: formData.specialRequirements,
        totalPrice: calculateTotalPrice()
      };

      // Check availability one more time before submitting
      const isAvailable = hallHireBookingService.isTimeSlotAvailable(
        bookingData.eventDate,
        bookingData.startTime,
        bookingData.endTime
      );

      if (!isAvailable) {
        alert('This time slot is no longer available. Please select a different time or date.');
        return;
      }

      const response = await hallHireService.submitBooking(bookingData);

      if (response.success) {
        // Save booking locally to prevent double bookings
        hallHireBookingService.addBooking({
          ...bookingData,
          status: 'pending'
        });

        setSubmitSuccess(true);
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
        }, 3000);
      } else {
        alert(`Booking failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.customerName.trim() !== '' &&
      formData.customerEmail.trim() !== '' &&
      formData.customerPhone.trim() !== '' &&
      formData.eventDate !== '' &&
      formData.startTime !== '' &&
      formData.endTime !== '' &&
      formData.expectedAttendees !== '' &&
      formData.eventType !== '' &&
      !availabilityError
    );
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold mb-4">Booking Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your hall hire enquiry. We'll get back to you within 24 hours to confirm your booking.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {formData.customerEmail}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Book Hall Hire</h2>
            <p className="text-gray-600">{selectedPackage.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Package Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{selectedPackage.name}</h3>
              <p className="text-sm text-gray-600">{selectedPackage.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-700">
                £{calculateTotalPrice()}
              </div>
              <div className="text-sm text-gray-500">
                {selectedPackage.duration}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select event type</option>
                  <option value="birthday-party">Birthday Party</option>
                  <option value="corporate-event">Corporate Event</option>
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Meeting</option>
                  <option value="fitness-class">Fitness Class</option>
                  <option value="dance-class">Dance Class</option>
                  <option value="wedding-reception">Wedding Reception</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

                     {/* Time and Capacity */}
           <div>
             <h3 className="text-lg font-semibold mb-4 flex items-center">
               <Clock className="w-5 h-5 mr-2" />
               Time & Capacity
             </h3>
             
             {availabilityError && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                 <div className="flex items-center">
                   <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                   <span className="text-red-700 text-sm">{availabilityError}</span>
                 </div>
               </div>
             )}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Attendees *
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleInputChange}
                  min="1"
                  max={selectedPackage.capacity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {selectedPackage.capacity} people
                </p>
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Special Requirements
            </h3>
            <textarea
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleInputChange}
              rows={4}
              placeholder="Any special requirements, equipment needs, or additional services..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Important Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedPackage.restrictions.map((restriction, index) => (
                <li key={index}>• {restriction}</li>
              ))}
              <li>• A security deposit may be required for certain events</li>
              <li>• Cancellation policy: 48 hours notice required for full refund</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="px-6 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HallBookingForm; 