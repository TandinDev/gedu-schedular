import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [pendingAppointments, setPendingAppointments] = useState([
    {
      id: 1,
      studentName: 'Ugyen Zangmo',
      studentId: '2023001',
      date: '2024-03-20',
      time: '10:00',
      purpose: 'Project Discussion',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Sonam Dorji',
      studentId: '2023002',
      date: '2024-03-20',
      time: '15:00',
      purpose: 'Assignment Help',
      status: 'pending'
    }
  ]);

  const handleAppointmentResponse = (appointmentId, status) => {
    setPendingAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status }
          : apt
      )
    );
    // TODO: Implement API call to update appointment status
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Welcome, {user.name}
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Manage your appointments and timetable
        </p>
      </div>

      {/* Pending Appointments Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
          Pending Appointments
        </h2>
        {pendingAppointments.length === 0 ? (
          <p className="text-[var(--color-primary-600)]">
            No pending appointments.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-[var(--color-primary-200)] rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-[var(--color-primary-900)]">
                      {appointment.studentName}
                    </h3>
                    <p className="text-sm text-[var(--color-primary-600)]">
                      Student ID: {appointment.studentId}
                    </p>
                    <p className="text-sm text-[var(--color-primary-600)]">
                      {appointment.date} at {appointment.time}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-primary-700)]">
                      Purpose: {appointment.purpose}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAppointmentResponse(appointment.id, 'accepted')}
                      className="px-3 py-1 text-sm font-medium text-white bg-[var(--color-success-500)] 
                        hover:bg-[var(--color-success-600)] rounded-md transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAppointmentResponse(appointment.id, 'declined')}
                      className="px-3 py-1 text-sm font-medium text-white bg-[var(--color-error-500)] 
                        hover:bg-[var(--color-error-600)] rounded-md transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timetable Management */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
            Timetable Management
          </h2>
          <p className="text-[var(--color-primary-600)] mb-4">
            Update your weekly availability and manage your schedule.
          </p>
          <button
            onClick={() => {/* TODO: Navigate to timetable page */}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
              rounded-md text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
          >
            Manage Timetable
          </button>
        </div>

        {/* Profile Management */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
            Profile Management
          </h2>
          <p className="text-[var(--color-primary-600)] mb-4">
            Update your profile information and preferences.
          </p>
          <button
            onClick={() => {/* TODO: Navigate to profile page */}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
              rounded-md text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard; 