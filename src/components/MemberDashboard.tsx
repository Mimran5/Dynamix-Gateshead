import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import memberships from '../data/memberships';
import { classes as allClasses } from '../data/classes';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AttendanceHistory from './AttendanceHistory';
import AdminAttendance from './AdminAttendance';

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
  const [processingPayment, setProcessingPayment] = useState(false);
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
  const navigate = useNavigate();

  const isAdmin = user?.email === 'yudit@dynamixdga.com';

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Navigate to home page after logout
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth'); // Redirect to auth page if not logged in
      return;
    }
    setLoading(true);
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        setUserDoc(snap.exists() ? snap.data() : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        <div className="text-xl text-red-600">User data not found.</div>
      </div>
    );
  }

  const membership = memberships.find(m => m.id === userDoc.membershipType) || memberships[0];
  const classLimit = getClassLimit(userDoc.membershipType);
  const bookings = userDoc.bookings || [];
  const classesLeft = classLimit - bookings.length;
  const upcoming = allClasses.filter(c => bookings.includes(c.id));
  const available = allClasses.filter(c => !bookings.includes(c.id));

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

  const handleBook = async (classId: string) => {
    if (classesLeft <= 0) {
      setError('You have reached your class limit for this month.');
      return;
    }
    setError('');
    const ref = doc(db, 'users', user.uid);
    let newBookings = [...bookings, classId];
    let newRecurringBookings = [...recurringBookings];
    
    // Only add to recurring bookings if this specific class is marked as recurring
    if (recurringClassId === classId && directDebit) {
      newRecurringBookings = [...recurringBookings, classId];
    }
    
    await updateDoc(ref, { 
      bookings: newBookings,
      recurringBookings: newRecurringBookings
    });
    
    setUserDoc({ 
      ...userDoc, 
      bookings: newBookings,
      recurringBookings: newRecurringBookings
    });
    setRecurringBookings(newRecurringBookings);
    // Reset recurring state after booking
    setRecurringClassId(null);

    // Add to history
    const classDetails = allClasses.find(c => c.id === classId);
    await addToHistory('booking', {
      action: 'book',
      class: classDetails,
      recurring: recurringClassId === classId
    });
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

    // If upgrading, show payment modal
    if (newPlan.price > currentPlan.price) {
      setShowPaymentModal(true);
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
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { 
      membershipType: newMembership,
      pendingChange: false
    });
    setUserDoc({ 
      ...userDoc, 
      membershipType: newMembership,
      pendingChange: false
    });
    
    setProcessingPayment(false);
    setShowPaymentModal(false);
    setUpgrading(false);
    setNewMembership('');
    setPaymentSuccess(true);

    // Add to history
    const newPlan = memberships.find(m => m.id === newMembership);
    const currentPlan = memberships.find(m => m.id === userDoc.membershipType);
    await addToHistory('payment', {
      action: 'upgrade',
      from: currentPlan,
      to: newPlan,
      amount: newPlan?.price
    });
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

  const renderNavigation = () => (
    <div className="bg-white shadow">
      <nav className="flex space-x-8 px-4" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`${
            activeTab === 'profile'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`${
            activeTab === 'notifications'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('membership')}
          className={`${
            activeTab === 'membership'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Membership
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`${
            activeTab === 'bookings'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Bookings
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`${
            activeTab === 'attendance'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          Attendance
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`${
              activeTab === 'admin'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Admin
          </button>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderNavigation()}
        <main className="mt-8">
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">My Portal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Profile Information</h3>
                  {editingProfile ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">Contact</label>
                        <input
                          type="text"
                          value={editContact}
                          onChange={(e) => setEditContact(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={handleProfileSave}
                          disabled={savingProfile}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <p className="text-base font-medium text-gray-500">Name</p>
                        <p className="mt-2 text-lg text-gray-900">{userDoc.name}</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-500">Email</p>
                        <p className="mt-2 text-lg text-gray-900">{userDoc.email}</p>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-500">Contact</p>
                        <p className="mt-2 text-lg text-gray-900">{userDoc.contact}</p>
                      </div>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Membership Status</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-base font-medium text-gray-500">Current Plan</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{membership.name}</p>
                    <p className="mt-4 text-base font-medium text-gray-500">Classes Remaining</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{classesLeft} of {classLimit}</p>
                    {pendingChange && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                        <p className="text-base text-yellow-700">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Notification Settings</h2>
              <div className="max-w-2xl">
                <div className="space-y-8">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Notification Method</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Notification Time</label>
                    <select
                      value={notifTime}
                      onChange={(e) => setNotifTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
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
                      className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-base text-gray-900">
                      Enable Direct Debit for recurring classes
                    </label>
                  </div>
                  <button
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    {savingProfile ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'membership' && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">💳 Class Packages</h2>
              <p className="text-xl text-gray-600 mb-8">
                Skip the drop-in fee and save with our flexible monthly packages!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {memberships.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-8 flex flex-col justify-between h-full ${
                      plan.id === userDoc.membershipType
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 text-4xl font-bold text-gray-900">£{plan.price}</div>
                    <div className="mt-2 text-base text-gray-500">per month</div>
                    <div className="mt-2 text-sm text-gray-600">
                      £{plan.costPerClass} per class (Save £{plan.savings}/month)
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">
                      {plan.usage}
                    </div>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-base text-gray-600">
                          <svg className="h-6 w-6 text-teal-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.id !== userDoc.membershipType && (
                      <button
                        onClick={() => {
                          setNewMembership(plan.id);
                          setUpgrading(true);
                        }}
                        className="mt-auto w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        {plan.price > membership.price ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-6">📊 Compare & Save</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Savings</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {memberships.map((plan) => (
                          <tr key={plan.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{plan.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.features[0].split(' ')[0]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{plan.costPerClass}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{plan.savings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.usage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'bookings' && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Class Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Upcoming Classes</h3>
                  {upcoming.length === 0 ? (
                    <p className="text-base text-gray-500">No upcoming classes booked.</p>
                  ) : (
                    <div className="space-y-6">
                      {upcoming.map((classItem) => (
                        <div key={classItem.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xl font-medium text-gray-900">{classItem.name}</h4>
                              <p className="mt-2 text-base text-gray-500">{classItem.day} at {classItem.time}</p>
                              <p className="mt-1 text-base text-gray-500">Instructor: {classItem.instructor}</p>
                              {recurringBookings.includes(classItem.id) && (
                                <p className="mt-1 text-sm text-teal-600">Recurring booking</p>
                              )}
                            </div>
                            <button
                              onClick={() => setShowCancelConfirm(classItem.id)}
                              className="px-6 py-3 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Available Classes</h3>
                  <div className="space-y-6">
                    {available.map((classItem) => (
                      <div key={classItem.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-medium text-gray-900">{classItem.name}</h4>
                            <p className="mt-2 text-base text-gray-500">{classItem.day} at {classItem.time}</p>
                            <p className="mt-1 text-base text-gray-500">Instructor: {classItem.instructor}</p>
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
                          <button
                            onClick={() => handleBook(classItem.id)}
                            disabled={classesLeft <= 0}
                            className={`px-6 py-3 rounded-md text-base font-medium ${
                              classesLeft <= 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                          >
                            Book
                          </button>
                        </div>
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
          {activeTab === 'admin' && isAdmin && (
            <div className="bg-white shadow rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
              <div className="space-y-8">
                <AdminAttendance />
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                    />
                    <select
                      value={membershipFilter}
                      onChange={(e) => setMembershipFilter(e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                    >
                      <option value="">All Memberships</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <select
                      value={directDebitFilter}
                      onChange={(e) => setDirectDebitFilter(e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3"
                    >
                      <option value="">All Direct Debit</option>
                      <option value="true">With Direct Debit</option>
                      <option value="false">Without Direct Debit</option>
                    </select>
                  </div>
                  {loadingUsers ? (
                    <div className="text-center py-8 text-base">Loading users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                              Membership
                            </th>
                            <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                              Direct Debit
                            </th>
                            <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allUsers
                            .filter(user => {
                              const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                user.email?.toLowerCase().includes(searchQuery.toLowerCase());
                              const matchesMembership = !membershipFilter || user.membershipType === membershipFilter;
                              const matchesDirectDebit = directDebitFilter === '' || 
                                (directDebitFilter === 'true' && user.directDebit) ||
                                (directDebitFilter === 'false' && !user.directDebit);
                              return matchesSearch && matchesMembership && matchesDirectDebit;
                            })
                            .map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                                  {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                  {memberships.find(m => m.id === user.membershipType)?.name || 'Basic'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                  {user.directDebit ? 'Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="px-6 py-3 text-base font-medium text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard; 