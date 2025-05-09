import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import memberships from '../data/memberships';
import { classes as allClasses } from '../data/classes';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        setUserDoc(snap.exists() ? snap.data() : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!userDoc) return <div className="p-8 text-center text-red-600">User data not found.</div>;

  const membership = memberships.find(m => m.id === userDoc.membershipType) || memberships[0];
  const classLimit = getClassLimit(userDoc.membershipType);
  const bookings = userDoc.bookings || [];
  const classesLeft = classLimit - bookings.length;
  const upcoming = allClasses.filter(c => bookings.includes(c.id));
  const available = allClasses.filter(c => !bookings.includes(c.id));

  const handleBook = async (classId: string) => {
    if (classesLeft <= 0) {
      setError('You have reached your class limit for this month.');
      return;
    }
    setError('');
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { bookings: [...bookings, classId] });
    setUserDoc({ ...userDoc, bookings: [...bookings, classId] });
  };

  const handleCancel = async (classId: string) => {
    const ref = doc(db, 'users', user.uid);
    const updated = bookings.filter((id: string) => id !== classId);
    await updateDoc(ref, { bookings: updated });
    setUserDoc({ ...userDoc, bookings: updated });
  };

  const handleUpgrade = async () => {
    if (!newMembership) return;
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { membershipType: newMembership });
    setUserDoc({ ...userDoc, membershipType: newMembership });
    setUpgrading(false);
    setNewMembership('');
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Welcome, {user.email}</h2>
          <div className="text-gray-600 mb-1">Membership: <span className="font-semibold">{membership.name}</span></div>
          <div className="text-gray-600 mb-1">Classes left this month: <span className="font-semibold">{classesLeft}</span></div>
        </div>
        <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Logout</button>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Upcoming Bookings</h3>
        {upcoming.length === 0 ? (
          <div className="text-gray-500">No bookings yet.</div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map(c => (
              <li key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.day} {c.time}</div>
                </div>
                <button onClick={() => handleCancel(c.id)} className="text-red-600 hover:underline">Cancel</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Book a Class</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <ul className="space-y-2">
          {available.map(c => (
            <li key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.day} {c.time}</div>
              </div>
              <button onClick={() => handleBook(c.id)} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Book</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Upgrade Membership</h3>
        {upgrading ? (
          <div className="flex items-center space-x-2">
            <select value={newMembership} onChange={e => setNewMembership(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Select...</option>
              {memberships.filter(m => m.id !== userDoc.membershipType).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button onClick={handleUpgrade} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Upgrade</button>
            <button onClick={() => setUpgrading(false)} className="text-gray-500 hover:underline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setUpgrading(true)} className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700">Upgrade Membership</button>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard; 