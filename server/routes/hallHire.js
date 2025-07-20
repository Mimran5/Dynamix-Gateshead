const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Hall hire packages data
const hallHirePackages = [
  {
    id: 'hourly',
    name: 'Hourly Rate',
    price: 25,
    duration: 'Per Hour',
    capacity: 30
  },
  {
    id: 'half-day',
    name: 'Half Day Package',
    price: 120,
    duration: '4 Hours',
    capacity: 50
  },
  {
    id: 'full-day',
    name: 'Full Day Package',
    price: 200,
    duration: '8 Hours',
    capacity: 80
  },
  {
    id: 'weekend',
    name: 'Weekend Special',
    price: 350,
    duration: 'Weekend',
    capacity: 100
  }
];

// Get all hall hire packages
router.get('/packages', (req, res) => {
  res.json({ success: true, packages: hallHirePackages });
});

// Submit hall hire booking
router.post('/book', async (req, res) => {
  try {
    const {
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      startTime,
      endTime,
      expectedAttendees,
      eventType,
      specialRequirements,
      totalPrice
    } = req.body;

    // Validate required fields
    if (!packageId || !customerName || !customerEmail || !customerPhone || !eventDate || !startTime || !endTime || !expectedAttendees || !eventType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Check for conflicts with existing classes
    const eventDay = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' });
    const eventStartTime = startTime;
    const eventEndTime = endTime;

    // This would typically check against a database of classes
    // For now, we'll check against known class times
    const conflictingClasses = [
      { day: 'Monday', time: '17:45', duration: 60 },
      { day: 'Monday', time: '18:45', duration: 60 },
      { day: 'Monday', time: '20:00', duration: 60 },
      { day: 'Monday', time: '21:00', duration: 45 },
      { day: 'Tuesday', time: '19:15', duration: 60 },
      { day: 'Tuesday', time: '20:30', duration: 60 },
      { day: 'Wednesday', time: '17:30', duration: 60 },
      { day: 'Wednesday', time: '18:30', duration: 60 },
      { day: 'Wednesday', time: '20:15', duration: 60 },
      { day: 'Thursday', time: '18:15', duration: 45 },
      { day: 'Thursday', time: '18:50', duration: 50 },
      { day: 'Thursday', time: '19:45', duration: 60 },
      { day: 'Sunday', time: '18:15', duration: 45 },
      { day: 'Sunday', time: '19:15', duration: 45 },
      { day: 'Sunday', time: '20:00', duration: 60 }
    ];

    const hasConflict = conflictingClasses.some(classInfo => {
      if (classInfo.day !== eventDay) return false;
      
      const classStart = new Date(`2000-01-01T${classInfo.time}`);
      const classEnd = new Date(classStart.getTime() + classInfo.duration * 60000);
      const eventStart = new Date(`2000-01-01T${eventStartTime}`);
      const eventEnd = new Date(`2000-01-01T${eventEndTime}`);
      
      return (
        (eventStart < classEnd && eventEnd > classStart) ||
        (classStart < eventEnd && classEnd > eventStart)
      );
    });

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'This time slot conflicts with existing classes. Please select a different time or date.'
      });
    }

    // Find the selected package
    const selectedPackage = hallHirePackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid package selected' 
      });
    }

    // Create booking object
    const booking = {
      id: `booking_${Date.now()}`,
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      startTime,
      endTime,
      expectedAttendees: parseInt(expectedAttendees),
      eventType,
      specialRequirements: specialRequirements || '',
      totalPrice: parseFloat(totalPrice),
      status: 'pending',
      createdAt: new Date()
    };

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Hall Hire Booking Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your hall hire enquiry. We have received your booking request and will get back to you within 24 hours to confirm availability.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
          <p><strong>Package:</strong> ${selectedPackage.name}</p>
          <p><strong>Event Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Event Type:</strong> ${eventType}</p>
          <p><strong>Expected Attendees:</strong> ${expectedAttendees}</p>
          <p><strong>Total Price:</strong> £${totalPrice}</p>
          ${specialRequirements ? `<p><strong>Special Requirements:</strong> ${specialRequirements}</p>` : ''}
        </div>
        
        <p>If you have any questions, please don't hesitate to contact us:</p>
        <p>📞 0191 XXX XXXX<br>
        📧 hallhire@dynamixgateshead.com</p>
        
        <p>Best regards,<br>
        The Dynamix Gateshead Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: 'Hall Hire Booking Enquiry - Dynamix Gateshead',
      html: customerEmailHtml
    });

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Hall Hire Booking Enquiry</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Customer Information</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          
          <h3 style="color: #1f2937;">Event Details</h3>
          <p><strong>Package:</strong> ${selectedPackage.name}</p>
          <p><strong>Event Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Event Type:</strong> ${eventType}</p>
          <p><strong>Expected Attendees:</strong> ${expectedAttendees}</p>
          <p><strong>Total Price:</strong> £${totalPrice}</p>
          ${specialRequirements ? `<p><strong>Special Requirements:</strong> ${specialRequirements}</p>` : ''}
        </div>
        
        <p>Please review this booking request and contact the customer to confirm availability.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'New Hall Hire Booking Enquiry',
      html: adminEmailHtml
    });

    // Here you would typically save the booking to a database
    console.log('Hall hire booking received:', booking);

    res.status(200).json({ 
      success: true, 
      message: 'Booking enquiry submitted successfully',
      bookingId: booking.id
    });

  } catch (error) {
    console.error('Error processing hall hire booking:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process booking enquiry' 
    });
  }
});

// Get booking status (for future use)
router.get('/booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  // Here you would typically fetch the booking from a database
  // For now, return a mock response
  res.json({
    success: true,
    booking: {
      id: bookingId,
      status: 'pending',
      message: 'Booking is being reviewed'
    }
  });
});

module.exports = router; 