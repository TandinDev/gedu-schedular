import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments] = useState([]); // This would come from an API

  // Mock available time slots - this would come from the lecturer's timetable
  const availableSlots = [
    { id: 1, time: '09:00', lecturer: 'Dr. Wangchuk', available: true },
    { id: 2, time: '10:00', lecturer: 'Dr. Wangchuk', available: false, bookedBy: 'Ugyen Zangmo' },
    { id: 3, time: '11:00', lecturer: 'Dr. Wangchuk', available: true },
    { id: 4, time: '14:00', lecturer: 'Dr. Wangchuk', available: true },
    { id: 5, time: '15:00', lecturer: 'Dr. Wangchuk', available: false, bookedBy: 'Sonam Dorji' },
  ];

  const handleBookAppointment = (slot) => {
    // TODO: Implement appointment booking logic
    console.log('Booking appointment:', slot);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Welcome, {user.name}
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Book appointments with your lecturers
        </p>
      </div>

      {/* Appointment Booking Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
          Book an Appointment
        </h2>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="block w-full rounded-md border-[var(--color-primary-200)] 
              shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
          />
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
            Available Time Slots
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-lg border ${
                  slot.available
                    ? 'border-[var(--color-primary-200)] bg-white hover:border-[var(--color-primary-500)] cursor-pointer'
                    : 'border-[var(--color-primary-100)] bg-[var(--color-primary-50)]'
                }`}
                onClick={() => slot.available && handleBookAppointment(slot)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[var(--color-primary-900)]">
                      {slot.time}
                    </p>
                    <p className="text-sm text-[var(--color-primary-600)]">
                      {slot.lecturer}
                    </p>
                  </div>
                  {!slot.available && (
                    <span className="text-xs text-[var(--color-primary-500)] bg-[var(--color-primary-100)] px-2 py-1 rounded">
                      Booked by {slot.bookedBy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Appointments Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
          My Appointments
        </h2>
        {appointments.length === 0 ? (
          <p className="text-[var(--color-primary-600)]">
            You haven't booked any appointments yet.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Appointment list would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 