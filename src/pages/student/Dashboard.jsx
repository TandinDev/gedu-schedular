import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Initialize selectedDate based on current day
  const getInitialDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // If it's weekend (Saturday or Sunday), set to next Monday
    if (dayOfWeek === 0) {
      // Sunday
      today.setDate(today.getDate() + 1); // Move to Monday
    } else if (dayOfWeek === 6) {
      // Saturday
      today.setDate(today.getDate() + 2); // Move to Monday
    }

    // Set time to noon to avoid timezone issues
    today.setHours(12, 0, 0, 0);
    return today;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purpose, setPurpose] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Fetch appointments and available slots
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get student's appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('studentId', '==', user.uid)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const studentAppointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get available lecturers
        const lecturersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'lecturer')
        );
        const lecturersSnapshot = await getDocs(lecturersQuery);
        const lecturers = lecturersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Add lecturer details to appointments
        const appointmentsWithDetails = studentAppointments.map((apt) => ({
          ...apt,
          lecturerName: lecturers.find(l => l.id === apt.lecturerId)?.name || "Unknown Lecturer",
          lecturerDepartment: lecturers.find(l => l.id === apt.lecturerId)?.department || "Unknown Department",
        }));

        setAppointments(appointmentsWithDetails);

        // Get available slots for the selected date
        const selectedDateStr = selectedDate.toISOString().split("T")[0];

        // Validate if the selected date is a weekday
        const dayIndex = selectedDate.getDay();
        if (dayIndex === 0 || dayIndex === 6) {
          setAvailableSlots([]);
          setError("Appointments are only available on weekdays (Monday to Friday)");
          return;
        }

        // Get availability for each lecturer
        const slots = [];
        for (const lecturer of lecturers) {
          const availabilityQuery = query(
            collection(db, 'availability'),
            where('lecturerId', '==', lecturer.id),
            where('date', '==', selectedDateStr)
          );
          const availabilitySnapshot = await getDocs(availabilityQuery);

          availabilitySnapshot.docs.forEach(doc => {
            const availability = doc.data();
            availability.times.forEach(time => {
              // Check if this slot is already booked
              const isBooked = appointmentsWithDetails.some(
                apt => apt.lecturerId === lecturer.id && 
                       apt.date === selectedDateStr && 
                       apt.time === time
              );

              slots.push({
                id: `${lecturer.id}-${time}`,
                time,
                lecturer: lecturer.name,
                department: lecturer.department,
                lecturerId: lecturer.id,
                available: !isBooked
              });
            });
          });
        }

        setAvailableSlots(slots);
        setError("");
      } catch {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, selectedDate]);

  const handleBookAppointment = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!purpose.trim()) {
      setError("Please provide a purpose for the appointment");
      return;
    }

    try {
      setLoading(true);
      const newAppointment = {
        studentId: user.uid,
        lecturerId: selectedSlot.lecturerId,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedSlot.time,
        purpose: purpose.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'appointments'), newAppointment);
      const createdAppointment = {
        id: docRef.id,
        ...newAppointment,
        lecturerName: selectedSlot.lecturer,
        lecturerDepartment: selectedSlot.department
      };

      setAppointments((prev) => [...prev, createdAppointment]);
      setAvailableSlots((prev) =>
        prev.map((slot) =>
          slot.id === selectedSlot.id ? { ...slot, available: false } : slot
        )
      );

      setShowBookingModal(false);
      setSelectedSlot(null);
      setPurpose("");
      setError("");
    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'appointments', appointmentToCancel.id), {
        status: 'cancelled'
      });

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentToCancel.id
            ? { ...apt, status: "cancelled" }
            : apt
        )
      );

      // Refresh available slots
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      const updatedSlots = availableSlots.map((slot) => {
        const wasBooked = appointments.find(
          (apt) =>
            apt.id === appointmentToCancel.id &&
            apt.date === selectedDateStr &&
            apt.time === slot.time &&
            apt.lecturerId === slot.lecturerId
        );

        if (wasBooked) {
          return { ...slot, available: true };
        }
        return slot;
      });

      setAvailableSlots(updatedSlots);
      setError("");
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setError("Failed to cancel appointment. Please try again.");
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

  // Update the date selection handler
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    // Ensure we're using the current year
    const currentYear = new Date().getFullYear();
    newDate.setFullYear(currentYear);

    // Set the time to noon to avoid timezone issues
    newDate.setHours(12, 0, 0, 0);
    setSelectedDate(newDate);
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

  // Add delete handler
  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'appointments', appointmentToDelete.id));

      // Update local state by removing the deleted appointment
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== appointmentToDelete.id)
      );

      setError("");
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to delete appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter((appointment) => {
    // Status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Date range filter
    if (
      dateRange.start &&
      new Date(appointment.date) < new Date(dateRange.start)
    ) {
      return false;
    }
    if (dateRange.end && new Date(appointment.date) > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });

  // Filter available slots based on search
  const filteredSlots = availableSlots.filter((slot) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      slot.lecturer.toLowerCase().includes(searchLower) ||
      slot.department.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-primary-900)]">
          Welcome, {user.name}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[var(--color-primary-600)]">
          Book appointments with your lecturers
        </p>
      </div>

      {error && (
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md ${getMessageStyle(
            "error"
          )}`}
        >
          {error}
        </div>
      )}

      {/* Appointment Booking Section - Moved up for better mobile UX */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
          Book an Appointment
        </h2>

        {/* Date Selection */}
        <div className="mb-4 sm:mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-[var(--color-primary-700)] mb-2"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            max={
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            className="block w-full h-11 px-4 rounded-lg border-[var(--color-primary-200)] 
              shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
              text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
              text-sm sm:text-base transition-colors"
          />
          <p
            className={`mt-2 text-xs sm:text-sm ${getMessageStyle(
              "info"
            )} px-3 py-2 rounded-md`}
          >
            Select a weekday (Monday to Friday) to view available slots
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-primary-400)]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lecturer name or department..."
                className="block w-full h-11 pl-10 pr-4 rounded-lg border-[var(--color-primary-200)] 
                  shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                  text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                  text-sm sm:text-base transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
            Available Time Slots
          </label>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary-500)]"></div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md ${getMessageStyle(
                "warning"
              )}`}
            >
              {availableSlots.length === 0
                ? "No available slots for the selected date."
                : "No lecturers match your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                    slot.available
                      ? "border-[var(--color-primary-200)] bg-white hover:border-[var(--color-primary-500)] cursor-pointer"
                      : "border-[var(--color-primary-100)] bg-[var(--color-primary-50)]"
                  }`}
                  onClick={() => slot.available && handleBookAppointment(slot)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[var(--color-primary-900)] text-sm sm:text-base">
                        {slot.time}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--color-primary-600)]">
                        {slot.lecturer}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--color-primary-600)]">
                        {slot.department}
                      </p>
                    </div>
                    {!slot.available && (
                      <span className="text-xs text-[var(--color-primary-500)] bg-[var(--color-primary-100)] px-2 py-1 rounded">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment History with Search and Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-lg font-medium text-[var(--color-primary-900)]">
            Your Appointments
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-[var(--color-primary-200)] 
                rounded-lg text-sm font-medium text-[var(--color-primary-700)] 
                hover:bg-[var(--color-primary-50)] transition-colors w-full sm:w-auto justify-center"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 border border-[var(--color-primary-200)] rounded-lg bg-[var(--color-primary-50)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full h-11 px-3 rounded-lg border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)] text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="block w-full h-11 px-3 rounded-lg border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)] text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="block w-full h-11 px-3 rounded-lg border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)] text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setDateRange({ start: "", end: "" });
                }}
                className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary-500)]"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md ${getMessageStyle(
              "info"
            )}`}
          >
            {appointments.length === 0
              ? "You have no appointments yet."
              : "No appointments match your filters."}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-[var(--color-primary-200)] rounded-lg p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-primary-900)] text-sm sm:text-base">
                      {formatDate(appointment.date)} at {appointment.time}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-primary-600)]">
                      Lecturer: {appointment.lecturerName}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--color-primary-600)]">
                      Department: {appointment.lecturerDepartment}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--color-primary-700)]">
                      Purpose: {appointment.purpose}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleCancelClick(appointment)}
                          className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      )}
                      {appointment.status === "cancelled" && (
                        <button
                          onClick={() => handleDeleteClick(appointment)}
                          className="p-1.5 text-red-500 hover:text-red-600 
                            hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Appointment"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
              Book Appointment
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${getMessageStyle("info")}`}>
                <p className="text-sm font-medium">
                  Lecturer: {selectedSlot.lecturer}
                </p>
                <p className="text-sm">Department: {selectedSlot.department}</p>
                <p className="text-sm">Date: {formatDate(selectedDate)}</p>
                <p className="text-sm">Time: {selectedSlot.time}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-primary-700)] mb-2">
                  Purpose of Meeting
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="block w-full min-h-[120px] px-4 py-3 rounded-md border-[var(--color-primary-200)] 
                    shadow-sm focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]
                    text-[var(--color-primary-900)] placeholder-[var(--color-primary-400)]
                    resize-y"
                  placeholder="Please describe the purpose of your meeting..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setPurpose("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary-700)] 
                    bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-md 
                    hover:bg-[var(--color-primary-100)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!purpose.trim() || loading}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-[var(--color-primary-500)] rounded-md 
                    hover:bg-[var(--color-primary-600)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
              Cancel Appointment
            </h3>
            <div className="space-y-4">
              <p
                className={`px-4 py-3 rounded-md ${getMessageStyle("warning")}`}
              >
                Are you sure you want to cancel your appointment with{" "}
                {appointmentToCancel.lecturerName}?
              </p>
              <div className={`p-4 rounded-md ${getMessageStyle("info")}`}>
                <p className="text-sm">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(appointmentToCancel.date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time:</span>{" "}
                  {appointmentToCancel.time}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Purpose:</span>{" "}
                  {appointmentToCancel.purpose}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setAppointmentToCancel(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary-700)] 
                    bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-md 
                    hover:bg-[var(--color-primary-100)] transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-red-600 rounded-md 
                    hover:bg-red-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {loading ? "Cancelling..." : "Yes, Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-[var(--color-primary-900)] mb-4">
              Delete Appointment
            </h3>
            <div className="space-y-4">
              <p className={`px-4 py-3 rounded-md ${getMessageStyle("error")}`}>
                Are you sure you want to permanently delete this cancelled
                appointment?
              </p>
              <div className={`p-4 rounded-md ${getMessageStyle("info")}`}>
                <p className="text-sm">
                  <span className="font-medium">Lecturer:</span>{" "}
                  {appointmentToDelete.lecturerName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(appointmentToDelete.date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time:</span>{" "}
                  {appointmentToDelete.time}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Purpose:</span>{" "}
                  {appointmentToDelete.purpose}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setAppointmentToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary-700)] 
                    bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-md 
                    hover:bg-[var(--color-primary-100)] transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAppointment}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-red-600 rounded-md 
                    hover:bg-red-700
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {loading ? "Deleting..." : "Yes, Delete Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
