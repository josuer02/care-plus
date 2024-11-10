"use client";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  User,
  Phone,
  Mail,
  MoreVertical,
  X,
  RefreshCw,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isSameDay, addMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { appointmentService } from "@/services/appointmentService";
import { doctorService } from "@/services/doctorService";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Appointment {
  _id: string;
  datetime: Date;
  patientId: string;
  doctorId: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  patient: Patient;
  doctor: Doctor;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

interface AppointmentDetailsProps {
  appointment: Appointment;
}

interface RescheduleDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  onSelect: (time: string) => void;
}
const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, onSelect }) => (
  <div className="space-y-2">
    {slots.map((slot) => (
      <Button
        key={slot.time}
        variant="outline"
        className={cn(
          "w-full justify-start",
          !slot.isAvailable && "opacity-50 cursor-not-allowed"
        )}
        disabled={!slot.isAvailable}
        onClick={() => onSelect(slot.time)}
      >
        <Clock className="mr-2 h-4 w-4" />
        {slot.time}
        {!slot.isAvailable && (
          <span className="ml-auto text-xs text-red-500">(Unavailable)</span>
        )}
      </Button>
    ))}
  </div>
);

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getByDate(selectedDate);
      console.log("Raw appointments data:", data); // Add this log

      const appointmentsArray = Array.isArray(data) ? data : [];
      console.log("Appointments array:", appointmentsArray); // Add this log

      const filteredAppointments = selectedDoctor
        ? appointmentsArray.filter(
            (apt: Appointment) => apt.doctorId === selectedDoctor
          )
        : appointmentsArray;
      console.log("Filtered appointments:", filteredAppointments); // Add this log

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (
    appointment: Appointment,
    newDateTime: Date
  ) => {
    try {
      const updatedAppointment = await appointmentService.reschedule(
        appointment._id,
        newDateTime
      );

      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointment._id
            ? {
                ...apt,
                datetime: newDateTime,
                status: "SCHEDULED" as const,
              }
            : apt
        )
      );

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });

      setIsRescheduling(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentService.cancel(appointmentId);
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== appointmentId)
      );
      setSelectedAppointment(null);

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    let startTime = new Date(date);
    startTime.setHours(9, 0, 0); // Start at 9 AM

    while (startTime.getHours() < 17) {
      // End at 5 PM
      slots.push({
        time: format(startTime, "HH:mm"),
        isAvailable: true, // You'll need to check against existing appointments
      });
      startTime = addMinutes(startTime, 30); // 30-minute slots
    }

    return slots;
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({
    appointment,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={`p-4 mb-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
          appointment.status === "SCHEDULED"
            ? "border-l-green-500"
            : "border-l-red-500"
        }`}
        onClick={() => setSelectedAppointment(appointment)}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(appointment.datetime), "HH:mm")}</span>
              <Badge
                variant={
                  appointment.status === "SCHEDULED" ? "default" : "destructive"
                }
              >
                {appointment.status.toLowerCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setIsRescheduling(true);
                  setSelectedAppointment(appointment);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCancel(appointment._id)}
                className="text-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );

  const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
    appointment,
  }) => (
    <Card className="p-6 bg-card">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold">Appointment Details</h3>
        <Badge
          variant={
            appointment.status === "SCHEDULED" ? "default" : "destructive"
          }
        >
          {appointment.status}
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Patient Name
            </label>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Doctor</label>
            <div className="font-medium">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Date & Time</label>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>
                {format(new Date(appointment.datetime), "PPP")} at{" "}
                {format(new Date(appointment.datetime), "HH:mm")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Contact</label>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{appointment.patient.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>{appointment.patient.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={() => {
              setIsRescheduling(true);
              setSelectedAppointment(appointment);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reschedule
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleCancel(appointment._id)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
  const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
    appointment,
    isOpen,
    onClose,
  }) => {
    const [newDate, setNewDate] = useState<Date>(new Date());
    const [newTime, setNewTime] = useState<string>("");
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // Update available slots when date changes
    useEffect(() => {
      if (appointment) {
        const slots = generateTimeSlots(newDate).filter((slot) => {
          const slotDateTime = new Date(newDate);
          const [hours, minutes] = slot.time.split(":");
          slotDateTime.setHours(parseInt(hours), parseInt(minutes));
          return (
            slot.isAvailable ||
            format(slotDateTime, "HH:mm") ===
              format(new Date(appointment.datetime), "HH:mm")
          );
        });
        setAvailableSlots(slots);
      }
    }, [newDate, appointment]);

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setNewDate(date);
        setNewTime(""); // Reset time when date changes
      }
    };

    const handleConfirmReschedule = () => {
      if (!appointment || !newTime) return;

      const newDateTime = new Date(newDate);
      const [hours, minutes] = newTime.split(":");
      newDateTime.setHours(parseInt(hours), parseInt(minutes));

      handleReschedule(appointment, newDateTime);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Date</label>
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={(date) =>
                    date < new Date() ||
                    date.getDay() === 0 ||
                    date.getDay() === 6
                  }
                  initialFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Time</label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem
                          key={slot.time}
                          value={slot.time}
                          disabled={
                            !slot.isAvailable &&
                            format(
                              new Date(appointment?.datetime || ""),
                              "HH:mm"
                            ) !== slot.time
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{slot.time}</span>
                            {!slot.isAvailable &&
                              format(
                                new Date(appointment?.datetime || ""),
                                "HH:mm"
                              ) !== slot.time && (
                                <span className="text-xs text-red-500 ml-2">
                                  (Unavailable)
                                </span>
                              )}
                            {format(
                              new Date(appointment?.datetime || ""),
                              "HH:mm"
                            ) === slot.time && (
                              <span className="text-xs text-blue-500 ml-2">
                                (Current)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-slots" disabled>
                        No available slots
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleConfirmReschedule}
                disabled={!newTime || !newDate}
                className="w-full"
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <Select
            value={selectedDoctor?.toString() ?? "all"} // Change empty string to "all"
            onValueChange={(value) =>
              setSelectedDoctor(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>{" "}
              {/* Change empty string to "all" */}
              {doctors.map((doctor) => (
                <SelectItem key={doctor._id} value={doctor._id.toString()}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calendar Column */}
            <Card className="md:col-span-4 p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) =>
                  date && setSelectedDate(date)
                }
                className="rounded-md"
                components={{
                  DayContent: (props: { date: Date }) => {
                    const hasAppointments = appointments.some((apt) =>
                      isSameDay(new Date(apt.datetime), props.date)
                    );
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div>{format(props.date, "d")}</div>
                        {hasAppointments && (
                          <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </Card>

            {/* Time Slots Column */}
            <Card className="md:col-span-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Available Times</h3>
              <ScrollArea className="h-[400px]">
                <TimeSlotPicker
                  slots={generateTimeSlots(selectedDate)}
                  onSelect={(time) => console.log(time)}
                />
              </ScrollArea>
            </Card>

            {/* Appointments Column */}
            <Card className="md:col-span-4 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <ScrollArea className="h-[400px]">
                <AnimatePresence>
                  {appointments
                    .filter((apt) =>
                      isSameDay(new Date(apt.datetime), selectedDate)
                    )
                    .map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                      />
                    ))}
                </AnimatePresence>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6">
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : Array.isArray(appointments) && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mb-4" />
                  <p>No appointments found</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedAppointment && (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            <AppointmentDetails appointment={selectedAppointment} />
          </DialogContent>
        </Dialog>
      )}

      {isRescheduling && (
        <RescheduleDialog
          appointment={selectedAppointment}
          isOpen={isRescheduling}
          onClose={() => setIsRescheduling(false)}
        />
      )}
    </div>
  );
}
