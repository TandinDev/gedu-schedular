import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Timetable = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize selectedDate based on current day
  const getInitialDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // If it's weekend (Saturday or Sunday), set to next Monday
    if (dayOfWeek === 0) { // Sunday
      today.setDate(today.getDate() + 1); // Move to Monday
    } else if (dayOfWeek === 6) { // Saturday
      today.setDate(today.getDate() + 2); // Move to Monday
    }
    
    // Set time to noon to avoid timezone issues
    today.setHours(12, 0, 0, 0);
    return today;
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const availabilityQuery = query(
          collection(db, 'availability'),
          where('lecturerId', '==', user.uid)
        );
        const availabilitySnapshot = await getDocs(availabilityQuery);
        const availabilityData = {};
        
        availabilitySnapshot.docs.forEach(doc => {
          const data = doc.data();
          availabilityData[data.date] = data.times;
        });
        
        setAvailability(availabilityData);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const toggleTimeSlot = (date, time) => {
    const dateStr = date.toISOString().split('T')[0];
    setAvailability(prev => {
      const dateSlots = prev[dateStr] || [];
      const newDateSlots = dateSlots.includes(time)
        ? dateSlots.filter(t => t !== time)
        : [...dateSlots, time].sort();
      
      return {
        ...prev,
        [dateStr]: newDateSlots
      };
    });
  };

  // Add handlers for Set All and Unset All
  const handleSetAll = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    setAvailability(prev => ({
      ...prev,
      [dateStr]: [...TIME_SLOTS].sort()
    }));
    // Force re-render by creating a new date object
    setSelectedDate(new Date(selectedDate));
  };

  const handleUnsetAll = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    setAvailability(prev => ({
      ...prev,
      [dateStr]: []
    }));
    // Force re-render by creating a new date object
    setSelectedDate(new Date(selectedDate));
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Get all dates that have availability
      const dates = Object.keys(availability);
      
      // Save each date's availability
      for (const date of dates) {
        const times = availability[date];
        if (times && times.length > 0) {
          // Create a unique document ID for this lecturer's availability on this date
          const docId = `${user.uid}_${date}`;
          await setDoc(doc(db, 'availability', docId), {
            lecturerId: user.uid,
            date,
            times,
            updatedAt: new Date()
          });
        } else {
          // If no times are selected, delete the document
          const docId = `${user.uid}_${date}`;
          await deleteDoc(doc(db, 'availability', docId));
        }
      }

      setSuccess('Availability updated successfully!');
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Update the date selection handler
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    // Ensure we're using the current year
    const currentYear = new Date().getFullYear();
    newDate.setFullYear(currentYear);
    
    // Set the time to noon to avoid timezone issues
    newDate.setHours(12, 0, 0, 0);
    
    // Check if the selected date is a weekend
    const dayIndex = newDate.getDay();
    if (dayIndex === 0 || dayIndex === 6) {
      setError('Weekends are not available for appointments. Please select a weekday (Monday to Friday).');
      return;
    }
    
    setSelectedDate(newDate);
    setError('');
  };

  // Add a function to get the next weekday
  const getNextWeekday = (date) => {
    const nextDay = new Date(date);
    // Ensure we're using the current year
    const currentYear = new Date().getFullYear();
    nextDay.setFullYear(currentYear);
    
    nextDay.setDate(date.getDate() + 1);
    
    // If it's a weekend, move to next Monday
    if (nextDay.getDay() === 0) { // Sunday
      nextDay.setDate(nextDay.getDate() + 1);
    } else if (nextDay.getDay() === 6) { // Saturday
      nextDay.setDate(nextDay.getDate() + 2);
    }
    
    return nextDay;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary-500)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Manage Availability
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Set your available time slots for student appointments
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)] px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-700)] px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-[var(--color-gray-700)] mb-2"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            min={getNextWeekday(new Date()).toISOString().split('T')[0]}
            max={getNextWeekday(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
            className="block w-full h-11 px-4 rounded-md border-[var(--color-gray-200)] 
              shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
              text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]
              transition-colors"
          />
          <p className="mt-2 text-sm bg-[var(--color-info-50)] border border-[var(--color-info-200)] text-[var(--color-info-700)] px-3 py-2 rounded-md">
            Select a weekday (Monday to Friday) to set your availability. Weekends are not available for appointments.
          </p>
        </div>

        {/* Timetable Grid */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-[var(--color-gray-900)] mb-4">
            {formatDate(selectedDate)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {TIME_SLOTS.map(time => {
              const dateStr = selectedDate.toISOString().split('T')[0];
              const isAvailable = availability[dateStr]?.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => toggleTimeSlot(selectedDate, time)}
                  className={`w-full h-12 rounded-md transition-colors ${
                    isAvailable
                      ? 'bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white'
                      : 'bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'
                  }`}
                  title={`${isAvailable ? 'Remove' : 'Add'} availability for ${formatDate(selectedDate)} at ${time}`}
                >
                  {time} - {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleUnsetAll}
              className="px-4 py-2 text-sm font-medium text-[var(--color-gray-700)] 
                bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] rounded-md 
                hover:bg-[var(--color-gray-100)] transition-colors"
            >
              Unset All
            </button>
            <button
              onClick={handleSetAll}
              className="px-4 py-2 text-sm font-medium text-[var(--color-primary-700)] 
                bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-md 
                hover:bg-[var(--color-primary-100)] transition-colors"
            >
              Set All
            </button>
            <button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white 
                bg-[var(--color-primary-500)] rounded-md 
                hover:bg-[var(--color-primary-600)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Availability'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-[var(--color-gray-900)] mb-4">
          Instructions
        </h2>
        <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-700)]">
          <li>Select a date using the date picker above</li>
          <li>Click on time slots to toggle availability</li>
          <li>Available slots will be shown in blue</li>
          <li>Students can only book appointments during your available slots</li>
          <li>Changes are not saved until you click the "Save Availability" button</li>
          <li>You can update your availability at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default Timetable; 