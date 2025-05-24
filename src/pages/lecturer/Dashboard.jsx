import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Get appointments for this lecturer
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('lecturerId', '==', user.uid)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const lecturerAppointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get student details for each appointment
        const studentIds = [...new Set(lecturerAppointments.map(apt => apt.studentId))];
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('__name__', 'in', studentIds)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const students = {};
        studentsSnapshot.docs.forEach(doc => {
          students[doc.id] = doc.data();
        });

        // Add student details to appointments
        const appointmentsWithDetails = lecturerAppointments.map(apt => ({
          ...apt,
          studentName: students[apt.studentId]?.name || "Unknown Student",
          studentId: students[apt.studentId]?.studentId || "Unknown ID",
          department: students[apt.studentId]?.department || "Unknown Department",
          year: students[apt.studentId]?.year || "Unknown Year"
        }));

        setAppointments(appointmentsWithDetails);
        setError("");
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      setError("");
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError("Failed to update appointment status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[var(--color-accent-50)] text-[var(--color-accent-700)] border-[var(--color-accent-200)]";
      case "accepted":
        return "bg-[var(--color-success-50)] text-[var(--color-success-700)] border-[var(--color-success-200)]";
      case "declined":
        return "bg-[var(--color-error-50)] text-[var(--color-error-700)] border-[var(--color-error-200)]";
      case "cancelled":
        return "bg-[var(--color-gray-50)] text-[var(--color-gray-700)] border-[var(--color-gray-200)]";
      default:
        return "bg-[var(--color-info-50)] text-[var(--color-info-700)] border-[var(--color-info-200)]";
    }
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter((appointment) => {
    // Status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Date range filter
    if (dateRange.start && new Date(appointment.date) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(appointment.date) > new Date(dateRange.end)) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        appointment.studentName.toLowerCase().includes(searchLower) ||
        appointment.studentId.toLowerCase().includes(searchLower) ||
        appointment.department.toLowerCase().includes(searchLower) ||
        appointment.purpose.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Group filtered appointments by status
  const pendingAppointments = filteredAppointments.filter(
    (apt) => apt.status === "pending"
  );
  const acceptedAppointments = filteredAppointments.filter(
    (apt) => apt.status === "accepted"
  );
  const declinedAppointments = filteredAppointments.filter(
    (apt) => apt.status === "declined"
  );

  const getMessageStyle = (type) => {
    switch (type) {
      case "error":
        return "bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)]";
      case "success":
        return "bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-700)]";
      case "warning":
        return "bg-[var(--color-accent-50)] border border-[var(--color-accent-200)] text-[var(--color-accent-700)]";
      case "info":
        return "bg-[var(--color-info-50)] border border-[var(--color-info-200)] text-[var(--color-info-700)]";
      default:
        return "bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] text-[var(--color-gray-700)]";
    }
  };

  const AppointmentList = ({ appointments, title, showActions = false }) => (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
        {title}
      </h2>
      {appointments.length === 0 ? (
        <p className="text-[var(--color-primary-600)]">
          No {title.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
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
                    {formatDate(appointment.date)} at {appointment.time}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-primary-700)]">
                    Purpose: {appointment.purpose}
                  </p>
                </div>
                {showActions && appointment.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "accepted")
                      }
                      className="px-3 py-1 text-sm font-medium text-white bg-[var(--color-success-500)] 
                        hover:bg-[var(--color-success-600)] rounded-md transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "declined")
                      }
                      className="px-3 py-1 text-sm font-medium text-white bg-[var(--color-error-500)] 
                        hover:bg-[var(--color-error-600)] rounded-md transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {!showActions && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Welcome la, {user.name}
        </h1>
        <p className="mt-1 text-[var(--color-primary-600)]">
          Manage your appointments and timetable
        </p>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-md ${getMessageStyle("error")}`}>
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by student ID, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full h-11 pl-10 pr-4 rounded-md border-[var(--color-primary-200)] 
                shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-primary-400)]" />
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-[var(--color-primary-200)] 
              rounded-md text-sm font-medium text-[var(--color-primary-700)] 
              hover:bg-[var(--color-primary-50)] transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 border border-[var(--color-primary-200)] rounded-lg bg-[var(--color-primary-50)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-[var(--color-primary-700)] mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-[var(--color-primary-700)] mb-2"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)]"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-[var(--color-primary-700)] mb-2"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  min={dateRange.start}
                  className="block w-full h-11 px-4 rounded-md border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)]"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setDateRange({ start: "", end: "" });
                  setSearchQuery("");
                }}
                className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Search Results Count */}
        {searchQuery && (
          <p className="text-sm text-[var(--color-primary-600)] mb-4">
            Found {filteredAppointments.length} appointment
            {filteredAppointments.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary-500)]"></div>
        </div>
      ) : (
        <>
          {/* Pending Appointments */}
          <AppointmentList
            appointments={pendingAppointments}
            title="Pending Appointments"
            showActions={true}
          />

          {/* Accepted Appointments */}
          <AppointmentList
            appointments={acceptedAppointments}
            title="Accepted Appointments"
          />

          {/* Declined Appointments */}
          <AppointmentList
            appointments={declinedAppointments}
            title="Declined Appointments"
          />
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Timetable Management */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
            Timetable Management
          </h2>
          <p className="text-[var(--color-primary-600)] mb-4">
            Update your weekly availability and manage your schedule.
          </p>
          <button
            onClick={() => navigate("/lecturer/timetable")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
              rounded-md text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
          >
            Manage Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
