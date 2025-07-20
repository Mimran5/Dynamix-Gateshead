# Hall Hire Feature - Dynamix Gateshead

## Overview
The Hall Hire feature has been successfully added to the Dynamix Gateshead website, providing a comprehensive venue booking system for events, workshops, parties, and special occasions.

## Features Implemented

### 1. Hall Hire Packages
- **Hourly Rate**: £25 per hour (up to 30 people)
- **Half Day Package**: £120 (4 hours, up to 50 people) - *Most Popular*
- **Full Day Package**: £200 (8 hours, up to 80 people)
- **Weekend Special**: £350 (full weekend access, up to 100 people)

### 2. Frontend Components

#### HallHire.tsx
- Main hall hire page with comprehensive package display
- Hero section with key features
- Package cards with pricing and features
- Detailed information sections (what's included, available times, restrictions)
- Contact information section
- Modal booking form integration

#### HallBookingForm.tsx
- Comprehensive booking form with validation
- Personal information fields
- Event details (date, time, type, attendees)
- Special requirements text area
- Real-time price calculation
- Form validation and error handling
- Success confirmation modal
- **Double booking prevention** - Checks against existing hall hire bookings
- **Class conflict detection** - Prevents bookings during scheduled classes
- **Real-time availability checking** - Shows availability errors immediately

#### HallHirePreview.tsx
- Home page preview section
- Quick overview of packages
- Call-to-action to full hall hire page
- Contact information display

### 3. Backend API

#### Routes (/api/hall-hire)
- `GET /packages` - Retrieve all hall hire packages
- `POST /book` - Submit a hall hire booking
- `GET /booking/:bookingId` - Get booking status (for future use)

#### Features
- Email notifications to customers and admins
- Booking validation
- Professional email templates
- Error handling and logging
- **Class conflict detection** - Prevents bookings during scheduled classes
- **Double booking prevention** - Server-side validation

### 4. Navigation Integration
- Added "Hall Hire" link to main navigation
- Added "Hall Hire" button to hero section
- Mobile-responsive navigation support

### 5. Timetable Integration
- **HallHireSchedule component** - Displays hall hire bookings in timetable
- **Conflict prevention** - Prevents double bookings with existing classes
- **Real-time availability** - Shows booking status and conflicts
- **Visual integration** - Hall hire bookings appear alongside regular classes

## File Structure

```
project/
├── src/
│   ├── components/
│   │   ├── HallHire.tsx              # Main hall hire page
│   │   ├── HallBookingForm.tsx       # Booking form modal
│   │   ├── HallHirePreview.tsx       # Home page preview
│   │   ├── HallHireSchedule.tsx      # Timetable integration
│   │   └── Timetable.tsx             # Updated with hall hire display
│   ├── data/
│   │   ├── hallHire.ts               # Package data and interfaces
│   │   └── hallHireBookings.ts       # Booking management and conflict detection
│   └── services/
│       └── hallHireService.ts        # API service functions
├── server/
│   ├── routes/
│   │   └── hallHire.js               # Backend API routes with conflict detection
│   └── index.js                      # Updated with hall hire routes
└── HALL_HIRE_README.md               # This documentation
```

## Setup Instructions

### Frontend
1. The hall hire components are already integrated into the main app
2. No additional setup required for the frontend

### Backend
1. Ensure the server is running: `cd server && npm start`
2. Set up environment variables for email functionality:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ADMIN_EMAIL=admin@dynamixgateshead.com
   ```

### Email Configuration
The system uses Gmail SMTP for sending booking confirmations:
- Customer receives booking confirmation email
- Admin receives notification of new booking enquiry
- Professional HTML email templates included

## Usage

### For Customers
1. Navigate to "Hall Hire" from the main menu
2. Browse available packages and pricing
3. Click "Book Now" on desired package
4. Fill out the comprehensive booking form
5. Submit and receive confirmation email

### For Administrators
1. Receive email notifications for new bookings
2. Review booking details in admin email
3. Contact customer to confirm availability
4. Update booking status as needed

## Customization Options

### Pricing
- Update package prices in `src/data/hallHire.ts`
- Modify backend package data in `server/routes/hallHire.js`

### Email Templates
- Customize email HTML templates in the booking route
- Update contact information and branding

### Package Features
- Add/remove package features in the data files
- Modify capacity limits and restrictions

### Styling
- All components use Tailwind CSS classes
- Consistent with existing website design
- Responsive design for all screen sizes

## Future Enhancements

1. **Database Integration**: Store bookings in a database
2. **Admin Dashboard**: Web interface for managing bookings
3. **Calendar Integration**: Real-time availability checking
4. **Payment Processing**: Online payment for bookings
5. **Booking Management**: Customer ability to view/modify bookings
6. **Automated Confirmations**: Automatic booking confirmations
7. **Analytics**: Booking statistics and reporting

## Technical Notes

- All components are TypeScript-based
- Responsive design using Tailwind CSS
- Form validation and error handling
- API error handling and user feedback
- Email notifications with professional templates
- Modular architecture for easy maintenance

## Support

For technical support or customization requests, please contact the development team. 