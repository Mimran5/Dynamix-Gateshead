import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import memberships from '../data/memberships';
import { classes as allClasses } from '../data/classes';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AttendanceHistory from './AttendanceHistory';
import AdminAttendance from './AdminAttendance';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useBooking } from '../context/BookingContext';
import { createCustomer, createSubscription } from '../services/subscriptionService';
import StripeProvider from './StripeProvider';

interface Class {
  id: string;
  name: string;
  day: string;
  time: string;
  instructor: string;
  capacity: number;
  attendees?: any[];
}

interface Booking {
  classId: string;
  className: string;
  day: string;
  time: string;
  instructor: string;
  bookedAt: string;
}

const getClassLimit = (membershipType: string) => {
  if (membershipType === 'basic') return 6;
  if (membershipType === 'standard') return 10;
  if (membershipType === 'family') return 20;
  return 0;
};

const MemberDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);
  const [newMembership, setNewMembership] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingChange, setPendingChange] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [notifType, setNotifType] = useState('email');
  const [notifTime, setNotifTime] = useState('24');
  const [savingProfile, setSavingProfile] = useState(false);
  const [directDebit, setDirectDebit] = useState(false);
  const [recurringClassId, setRecurringClassId] = useState<string | null>(null);
  const [ddCancelConfirm, setDDCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'membership' | 'bookings' | 'history' | 'admin' | 'attendance'>('profile');
  const [recurringBookings, setRecurringBookings] = useState<string[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [showRecurringCancelConfirm, setShowRecurringCancelConfirm] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    type: 'booking' | 'membership' | 'payment' | 'directDebit';
    date: Date;
    details: any;
  }[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    contact: '',
    membershipType: '',
    directDebit: false,
    notifType: 'email',
    notifTime: '24'
  });
  const [savingUser, setSavingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [directDebitFilter, setDirectDebitFilter] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    name: '',
    contact: '',
    membershipType: 'basic',
    directDebit: false,
    notifType: 'email',
    notifTime: '24'
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [classAttendees, setClassAttendees] = useState<Record<string, any[]>>({});
  const { bookClass, getClassAttendees } = useBooking();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const isAdmin = user?.email === 'yudit@dynamixdga.com';

  const handleLogout = async () => {
    await logout();
    navigate('/member', { replace: true }); // Redirect to member auth page if not logged in
  };

  useEffect(() => {
    if (!user) {
      navigate('/member', { replace: true }); // Redirect to member auth page if not logged in
      return;
    }
    setLoading(true);
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (!snap.exists()) {
          // Create user document if it doesn't exist
          const defaultUserData = {
            email: user.email,
            name: '',
            contact: '',
            membershipType: 'basic',
            bookings: [],
            recurringBookings: [],
            history: [],
            createdAt: new Date()
          };
          setDoc(doc(db, 'users', user.uid), defaultUserData).then(() => {
            setUserDoc(defaultUserData);
        setLoading(false);
          });
        } else {
          const userData = snap.data();
          setUserDoc(userData);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      });
  }, [user, navigate]);

  useEffect(() => {
    if (userDoc) {
      setEditName(userDoc.name || '');
      setEditContact(userDoc.contact || '');
      setNotifType(userDoc.notifType || 'email');
      setNotifTime(userDoc.notifTime || '24');
      setDirectDebit(userDoc.directDebit || false);
      setRecurringBookings(userDoc.recurringBookings || []);
      
      // Initialize history from userDoc
      const userHistory = userDoc.history || [];
      setHistory(userHistory.map((item: any) => ({
        ...item,
        date: item.date.toDate()
      })));
    }
  }, [userDoc]);

  useEffect(() => {
    if (activeTab === 'admin') {
      setLoadingUsers(true);
      const fetchUsers = async () => {
        try {
          const usersRef = collection(db, 'users');
          const snapshot = await getDocs(usersRef);
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllUsers(users);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowNewUserModal(false);
        setShowCancelConfirm(null);
        setShowRecurringCancelConfirm(null);
        setDDCancelConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const membership = userDoc ? memberships.find(m => m.id === userDoc.membershipType) || memberships[0] : memberships[0];
  const classLimit = userDoc ? getClassLimit(userDoc.membershipType) : 0;
  const bookings = userDoc?.bookings || [];
  const classesLeft = classLimit - bookings.length;
  const upcoming = allClasses.filter(c => bookings.includes(c.id));
  const available = allClasses.filter(c => !bookings.includes(c.id));

  useEffect(() => {
    const fetchClassAttendees = async () => {
      const attendees: Record<string, any[]> = {};
      for (const classItem of [...upcoming, ...available]) {
        const classAttendees = await getClassAttendees(classItem.id);
        attendees[classItem.id] = classAttendees;
      }
      setClassAttendees(attendees);
    };

    fetchClassAttendees();
  }, [upcoming, available, getClassAttendees]);

  if (!user) {
    return null; // Don't render anything if not authenticated
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!userDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">User data not found. Please try logging in again.</div>
      </div>
    );
  }

  const addToHistory = async (type: 'booking' | 'membership' | 'payment' | 'directDebit', details: any) => {
    const newHistoryItem = {
      type,
      date: new Date(),
      details
    };
    
    const ref = doc(db, 'users', user.uid);
    const updatedHistory = [...history, newHistoryItem];
    await updateDoc(ref, { history: updatedHistory });
    setHistory(updatedHistory);
  };

  const handleBookClass = async (classId: string) => {
    if (!user) return;
    
    try {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      const attendees = classData.attendees || [];
      
      // Check if class is full
      if (attendees.length >= classData.capacity) {
        throw new Error('Class is full');
      }

      // Check if user is already booked
      if (attendees.some((a: any) => a.userId === user.uid)) {
        throw new Error('You are already booked for this class');
      }

      // Get user data
      const userRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userRef);
      const userData = userDocSnap.data();

      // Add attendee details
      const attendeeData = {
        userId: user.uid,
        name: attendeeName || userData?.name || 'Anonymous',
        email: attendeeEmail || user.email,
        phone: attendeePhone || userData?.contact || '',
        bookedAt: new Date().toISOString()
      };

      await updateDoc(classRef, {
        attendees: [...attendees, attendeeData]
      });

      // Update user's bookings
      const bookings = userData?.bookings || [];

      await updateDoc(userRef, {
        bookings: [...bookings, {
          classId,
          className: classData.name,
          day: classData.day,
          time: classData.time,
          instructor: classData.instructor,
          bookedAt: new Date().toISOString()
        }]
      });

      setShowBookingForm(null);
      setAttendeeName('');
      setAttendeeEmail('');
      setAttendeePhone('');
      
      // Refresh user data
      const updatedUserDoc = await getDoc(userRef);
      setUserDoc(updatedUserDoc.data());
    } catch (error: any) {
      console.error('Error booking class:', error);
      setError(error.message);
    }
  };

  const handleCancel = async (classId: string) => {
    const ref = doc(db, 'users', user.uid);
    const updated = bookings.filter((id: string) => id !== classId);
    await updateDoc(ref, { bookings: updated });
    setUserDoc({ ...userDoc, bookings: updated });
    setShowCancelConfirm(null);

    // Add to history
    const classDetails = allClasses.find(c => c.id === classId);
    await addToHistory('booking', {
      action: 'cancel',
      class: classDetails
    });
  };

  const handleCancelRecurring = async (classId: string) => {
    const ref = doc(db, 'users', user.uid);
    const updated = recurringBookings.filter((id: string) => id !== classId);
    await updateDoc(ref, { recurringBookings: updated });
    setUserDoc({ ...userDoc, recurringBookings: updated });
    setRecurringBookings(updated);
    setShowRecurringCancelConfirm(null);
  };

  const handleUpgrade = async () => {
    if (!newMembership) return;
    const newPlan = memberships.find(m => m.id === newMembership);
    const currentPlan = memberships.find(m => m.id === userDoc.membershipType);
    
    if (!newPlan || !currentPlan) return;

    setProcessing(true);
    try {
      // Create or get customer
      const { customerId } = await createCustomer(user.email || '', user.email?.split('@')[0] || '');
      const priceId = getPriceIdForMembership(newMembership);
      const { clientSecret, subscriptionId } = await createSubscription(customerId, priceId);
      
      // If upgrading, show payment modal with Stripe
      if (newPlan.price > currentPlan.price) {
        setShowPaymentModal(true);
        setClientSecret(clientSecret);
        return;
      }

      // If downgrading, set pending change
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, { 
        membershipType: newMembership,
        pendingChange: true,
        changeEffectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setUserDoc({ 
        ...userDoc, 
        membershipType: newMembership,
        pendingChange: true,
        changeEffectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setUpgrading(false);
      setNewMembership('');
      setPendingChange(true);

      // Add to history
      await addToHistory('membership', {
        action: 'downgrade',
        from: currentPlan,
        to: newPlan,
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchaseForOthers = async (membershipId: string) => {
    if (!user) return;

    setProcessing(true);
    try {
      // Create or get customer
      const { customerId } = await createCustomer(user.email || '', user.email?.split('@')[0] || '');
      const priceId = getPriceIdForMembership(membershipId);
      const { clientSecret } = await createSubscription(customerId, priceId);
      
      setClientSecret(clientSecret);
      setShowPaymentModal(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getPriceIdForMembership = (membershipId: string): string => {
    const priceMap: { [key: string]: string } = {
      'basic': 'price_1QxYtXKZvIloP2hXKZvIloP2',
      'standard': 'price_1QxYtXKZvIloP2hXKZvIloP3',
      'family': 'price_1QxYtXKZvIloP2hXKZvIloP4'
    };
    return priceMap[membershipId] || '';
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    const ref = doc(db, 'users', user.uid);
    let bookings = userDoc.bookings || [];
    let membershipType = userDoc.membershipType;
    if (userDoc.directDebit && !directDebit) {
      bookings = [];
      membershipType = 'inactive';
    }
    await updateDoc(ref, {
      name: editName,
      contact: editContact,
      notifType,
      notifTime,
      directDebit,
      bookings,
      membershipType,
    });
    setUserDoc({ ...userDoc, name: editName, contact: editContact, notifType, notifTime, directDebit, bookings, membershipType });
    setEditingProfile(false);
    setSavingProfile(false);
    if (userDoc.directDebit && !directDebit) setDDCancelConfirm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      contact: user.contact || '',
      membershipType: user.membershipType || 'basic',
      directDebit: user.directDebit || false,
      notifType: user.notifType || 'email',
      notifTime: user.notifTime || '24'
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const ref = doc(db, 'users', editingUser.id);
      await updateDoc(ref, {
        name: editUserForm.name,
        contact: editUserForm.contact,
        membershipType: editUserForm.membershipType,
        directDebit: editUserForm.directDebit,
        notifType: editUserForm.notifType,
        notifTime: editUserForm.notifTime
      });

      // Update local state
      setAllUsers(users => users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...editUserForm }
          : u
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.name) {
      setError('Email and name are required');
      return;
    }

    setCreatingUser(true);
    setError('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserForm.email,
        Math.random().toString(36).slice(-8) // Generate random password
      );

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUserForm.email,
        name: newUserForm.name,
        contact: newUserForm.contact,
        membershipType: newUserForm.membershipType,
        directDebit: newUserForm.directDebit,
        notifType: newUserForm.notifType,
        notifTime: newUserForm.notifTime,
        createdAt: new Date(),
        bookings: [],
        recurringBookings: [],
        history: []
      });

      // Reset form and close modal
      setNewUserForm({
        email: '',
        name: '',
        contact: '',
        membershipType: 'basic',
        directDebit: false,
        notifType: 'email',
        notifTime: '24'
      });
      setShowNewUserModal(false);

      // Refresh users list
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  // Add this new function to filter users
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.contact?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMembership = !membershipFilter || user.membershipType === membershipFilter;
    
    const matchesDirectDebit = 
      directDebitFilter === '' || 
      (directDebitFilter === 'active' && user.directDebit) ||
      (directDebitFilter === 'inactive' && !user.directDebit);

    return matchesSearch && matchesMembership && matchesDirectDebit;
  });

  const getClassColor = (className: string) => {
    const colors: { [key: string]: string } = {
      'Pilates': 'bg-blue-100 text-blue-800',
      'Yoga': 'bg-purple-100 text-purple-800',
      'HIIT': 'bg-red-100 text-red-800',
      'Strength': 'bg-green-100 text-green-800',
      'Cardio': 'bg-yellow-100 text-yellow-800',
      'Stretch': 'bg-pink-100 text-pink-800',
      'Boxing': 'bg-orange-100 text-orange-800',
      'Dance': 'bg-indigo-100 text-indigo-800'
    };
    return colors[className] || 'bg-gray-100 text-gray-800';
  };

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-4 overflow-x-auto">
            {isAdmin ? (
              <>
            <button
                  onClick={() => setActiveTab('admin')}
              className={`${
                    activeTab === 'admin'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Admin Dashboard
            </button>
            <button
                  onClick={() => setActiveTab('bookings')}
              className={`${
                    activeTab === 'bookings'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Class Management
            </button>
            <button
                  onClick={() => setActiveTab('attendance')}
              className={`${
                    activeTab === 'attendance'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Attendance
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
            >
              Notifications
            </button>
            <button
                  onClick={() => setActiveTab('membership')}
              className={`${
                    activeTab === 'membership'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Membership
            </button>
              <button
                  onClick={() => setActiveTab('bookings')}
                className={`${
                    activeTab === 'bookings'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Bookings
              </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`${
                    activeTab === 'attendance'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap`}
                >
                  Attendance
                </button>
              </>
            )}
          </div>
          <div className="flex items-center ml-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
            >
              Logout
            </button>
        </div>
      </div>
    </nav>
    </div>
  );

  const renderBookingForm = (classId: string) => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Book Class</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="attendeeName" className="block text-sm font-medium text-gray-700">
              Attendee Name
            </label>
            <input
              type="text"
              id="attendeeName"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Enter attendee name"
            />
          </div>
          <div>
            <label htmlFor="attendeeEmail" className="block text-sm font-medium text-gray-700">
              Attendee Email
            </label>
            <input
              type="email"
              id="attendeeEmail"
              value={attendeeEmail}
              onChange={(e) => setAttendeeEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Enter attendee email"
            />
          </div>
          <div>
            <label htmlFor="attendeePhone" className="block text-sm font-medium text-gray-700">
              Attendee Phone
            </label>
            <input
              type="tel"
              id="attendeePhone"
              value={attendeePhone}
              onChange={(e) => setAttendeePhone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Enter attendee phone"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowBookingForm(null);
              setAttendeeName('');
              setAttendeeEmail('');
              setAttendeePhone('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleBookClass(classId)}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Book Class
          </button>
        </div>
      </div>
    </div>
  );

  const renderClassAttendees = (classId: string) => {
    const attendees = classAttendees[classId] || [];
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Class Attendees</h4>
        {attendees.length === 0 ? (
          <p className="text-sm text-gray-500">No attendees yet</p>
        ) : (
          <div className="space-y-2">
            {attendees.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">
                    {booking.guestInfo?.name || booking.userDetails?.name || 'Anonymous'}
                  </span>
                  {booking.guestInfo?.email && (
                    <span className="text-gray-500 ml-2">({booking.guestInfo.email})</span>
                  )}
                </div>
                <span className="text-gray-500">
                  {new Date(booking.bookedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderClassCard = (classItem: any) => {
    const isBooked = bookings.some((b: Booking) => b.classId === classItem.id);
    const attendees = classAttendees[classItem.id] || [];
    const isFull = attendees.length >= classItem.capacity;
    const isAdmin = user?.email === 'yudit@dynamixdga.com';
    const classColor = getClassColor(classItem.name);

    return (
      <div key={classItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className={`p-2 ${classColor}`}>
          <h3 className="text-lg font-medium">{classItem.name}</h3>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="mt-1 text-sm text-gray-500">{classItem.day} at {classItem.time}</p>
              <p className="mt-1 text-sm text-gray-500">Instructor: {classItem.instructor}</p>
              <p className="mt-1 text-sm text-gray-500">
                {attendees.length}/{classItem.capacity} spots filled
              </p>
            </div>
            <div className="flex space-x-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => setShowBookingForm(classItem.id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md"
                  >
                    Book for Guest
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(classItem.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    Cancel Class
                  </button>
                </>
              ) : (
                <>
                  {!isBooked && !isFull && (
                    <button
                      onClick={() => handleBookClass(classItem.id)}
                      disabled={classesLeft <= 0}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                        classesLeft <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'text-white bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      Book Class
                    </button>
                  )}
                  {isBooked && (
                    <button
                      onClick={() => setShowCancelConfirm(classItem.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {renderClassAttendees(classItem.id)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <main className="mt-8">
          {isAdmin ? (
            // Admin View
            <>
              {activeTab === 'admin' && (
                <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-teal-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-teal-900">Total Members</h3>
                      <p className="text-3xl font-bold text-teal-600">{allUsers.length}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900">Active Classes</h3>
                      <p className="text-3xl font-bold text-blue-600">{allClasses.length}</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-purple-900">Today's Bookings</h3>
                      <p className="text-3xl font-bold text-purple-600">
                        {allClasses.reduce((acc, c) => acc + (classAttendees[c.id]?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowAddClassModal(true)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <h4 className="font-medium text-gray-900">Add New Class</h4>
                        <p className="mt-1 text-sm text-gray-500">Create a new class schedule</p>
                      </button>
                      <button
                        onClick={() => setShowEditClassModal(true)}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                      >
                        <h4 className="font-medium text-gray-900">Edit Classes</h4>
                        <p className="mt-1 text-sm text-gray-500">Modify existing class schedules</p>
                      </button>
                    </div>
                  </div>
          </div>
        )}
              {activeTab === 'bookings' && (
                <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Management</h2>
                  <div className="mb-6">
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      <button
                        onClick={() => setSelectedDay('Monday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Monday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Monday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Tuesday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Tuesday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Tuesday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Wednesday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Wednesday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Wednesday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Thursday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Thursday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Thursday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Friday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Friday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Friday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Saturday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Saturday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Saturday
                      </button>
                      <button
                        onClick={() => setSelectedDay('Sunday')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          selectedDay === 'Sunday'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sunday
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {allClasses
                      .filter((c: Class) => c.day === selectedDay)
                      .sort((a: Class, b: Class) => a.time.localeCompare(b.time))
                      .map((classItem: Class) => renderClassCard(classItem))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Regular User View
            <>
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">My Portal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-6">Profile Information</h3>
                {editingProfile ? (
                  <div className="space-y-6">
                    <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                            <label className="block text-sm font-medium text-gray-700">Contact</label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleProfileSave}
                        disabled={savingProfile}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="mt-1 text-base text-gray-900">{userDoc.name}</p>
                    </div>
                    <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-base text-gray-900">{userDoc.email}</p>
                    </div>
                    <div>
                            <p className="text-sm font-medium text-gray-500">Contact</p>
                            <p className="mt-1 text-base text-gray-900">{userDoc.contact}</p>
                    </div>
                    <button
                      onClick={() => setEditingProfile(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-6">Membership Status</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-sm font-medium text-gray-500">Current Plan</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{membership.name}</p>
                        <p className="mt-4 text-sm font-medium text-gray-500">Classes Remaining</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{classesLeft} of {classLimit}</p>
                  {pendingChange && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                            <p className="text-sm text-yellow-700">
                        Your membership change will be effective on {userDoc.changeEffectiveDate.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
              {activeTab === 'notifications' && (
                <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Settings</h2>
                  <div className="max-w-2xl">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notification Method</label>
                        <select
                          value={notifType}
                          onChange={(e) => setNotifType(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notification Time</label>
                        <select
                          value={notifTime}
                          onChange={(e) => setNotifTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        >
                          <option value="24">24 hours before</option>
                          <option value="12">12 hours before</option>
                          <option value="6">6 hours before</option>
                          <option value="1">1 hour before</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={directDebit}
                          onChange={(e) => setDirectDebit(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Enable Direct Debit for recurring classes
                        </label>
                      </div>
                      <button
                        onClick={handleProfileSave}
                        disabled={savingProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {savingProfile ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
        {activeTab === 'membership' && (
          <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Class Packages</h2>
                  <p className="text-base text-gray-600 mb-8">
              Skip the drop-in fee and save with our flexible monthly packages!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {memberships.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-6 flex flex-col justify-between h-full ${
                    plan.id === userDoc.membershipType
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 text-3xl font-bold text-gray-900">£{plan.price}</div>
                    <div className="mt-1 text-sm text-gray-500">per month</div>
                    <div className="mt-2 text-sm text-gray-600">
                      £{plan.costPerClass} per class (Save £{plan.savings}/month)
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">
                      {plan.usage}
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <svg className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 space-y-3">
                    {plan.id === userDoc.membershipType ? (
                      <div className="text-sm text-teal-600 font-medium">Current Plan</div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setNewMembership(plan.id);
                            setUpgrading(true);
                          }}
                          disabled={processing}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                          {plan.price > membership.price ? 'Upgrade' : 'Downgrade'}
                        </button>
                        <button
                          onClick={() => handlePurchaseForOthers(plan.id)}
                          disabled={processing}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-teal-600 text-sm font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                          Purchase for Others
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="bg-white shadow rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Class Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-6">Upcoming Classes</h3>
                {upcoming.length === 0 ? (
                        <p className="text-sm text-gray-500">No upcoming classes booked.</p>
                ) : (
                        <div className="space-y-4">
                    {upcoming.map((classItem) => (
                            <div key={classItem.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                                  <h4 className="text-lg font-medium text-gray-900">{classItem.name}</h4>
                                  <p className="mt-1 text-sm text-gray-500">{classItem.day} at {classItem.time}</p>
                                  <p className="mt-1 text-sm text-gray-500">Instructor: {classItem.instructor}</p>
                            {recurringBookings.includes(classItem.id) && (
                              <p className="mt-1 text-sm text-teal-600">Recurring booking</p>
                            )}
                          </div>
                          <button
                            onClick={() => setShowCancelConfirm(classItem.id)}
                                  className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                              {renderClassAttendees(classItem.id)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-6">Available Classes</h3>
                      <div className="space-y-4">
                  {available.map((classItem) => (
                          <div key={classItem.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                                <h4 className="text-lg font-medium text-gray-900">{classItem.name}</h4>
                                <p className="mt-1 text-sm text-gray-500">{classItem.day} at {classItem.time}</p>
                                <p className="mt-1 text-sm text-gray-500">Instructor: {classItem.instructor}</p>
                          {directDebit && (
                            <div className="mt-2 flex items-center">
                              <input
                                type="checkbox"
                                id={`recurring-${classItem.id}`}
                                checked={recurringClassId === classItem.id}
                                onChange={(e) => setRecurringClassId(e.target.checked ? classItem.id : null)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`recurring-${classItem.id}`} className="ml-2 text-sm text-gray-600">
                                Book recurring
                              </label>
                            </div>
                          )}
                        </div>
                              <div className="flex space-x-2">
                        <button
                                  onClick={() => handleBookClass(classItem.id)}
                          disabled={classesLeft <= 0}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                            classesLeft <= 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          Book
                        </button>
                      </div>
                            </div>
                            {renderClassAttendees(classItem.id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
              {activeTab === 'attendance' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <AttendanceHistory />
          </div>
        )}
            </>
        )}
      </main>
      </div>
    </div>
  );
};

export default MemberDashboard; 