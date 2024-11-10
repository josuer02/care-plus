"use client";

import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Phone, Mail, User } from "lucide-react";
import { format, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentFormData, Doctor } from "@/types";
import { appointmentService } from "@/services/appointmentService";
import { doctorService } from "@/services/doctorService";
import { toast } from "@/hooks/use-toast";
import { patientService } from "@/services/patientService";

const formSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  doctorId: z.string({
    required_error: "Please select a doctor",
  }),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  appointmentTime: z.string({
    required_error: "Appointment time is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function AppointmentForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      email: "",
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      doctorId: undefined,
      appointmentDate: undefined,
      appointmentTime: "",
    },
  });

  const searchPatient = useCallback(
    debounce(async (phone: string) => {
      if (phone.length >= 10) {
        setIsSearching(true);
        try {
          const patient = await patientService.findByPhone(phone);
          if (patient) {
            form.setValue("firstName", patient.firstName);
            form.setValue("lastName", patient.lastName);
            form.setValue("email", patient.email);
            form.setValue("dateOfBirth", new Date(patient.dateOfBirth));

            toast({
              title: "Patient Found",
              description: "Patient information has been loaded",
            });
          }
        } catch (error) {
          console.error("Error searching patient:", error);
        } finally {
          setIsSearching(false);
        }
      }
    }, 500),
    [form] // Add form as a dependency
  );

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    return () => {
      searchPatient.cancel();
    };
  }, [searchPatient]);

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

  const loadAvailableSlots = async (doctorId: string, date: Date) => {
    try {
      const response = await doctorService.getAvailableSlots(doctorId, date);
      console.log("API Response:", response);

      // Extract and format the times from the UTC timestamps
      const formattedSlots = response.availableSlots.map((slot: string) => {
        const date = new Date(slot);
        // Get hours and minutes and format as HH:mm
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      });

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
      toast({
        title: "Error",
        description: "Failed to load available slots",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Get the base date from appointmentDate
      const appointmentDate = new Date(data.appointmentDate);

      // Parse the time
      const [hours, minutes] = data.appointmentTime.split(":");

      // Create a new date object with the combined date and time
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData: AppointmentFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        doctorId: data.doctorId,
        datetime: appointmentDateTime, // This will be a Date object
      };

      await appointmentService.create(appointmentData);

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });

      form.reset();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor selection to load available slots
  const handleDoctorSelect = (doctorId: string) => {
    const date = form.getValues("appointmentDate");
    if (date) {
      loadAvailableSlots(doctorId, date);
    }
    form.setValue("doctorId", doctorId);
    form.setValue("appointmentTime", ""); // Clear time when doctor changes
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const doctorId = form.getValues("doctorId");
      if (doctorId) {
        loadAvailableSlots(doctorId, date);
      }
      form.setValue("appointmentDate", date);
      form.setValue("appointmentTime", ""); // Clear time when date changes
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* Contact Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(555) 555-5555"
                          className="pl-4 h-12 text-lg"
                          value={field.value || ""} // Add this to ensure the value is always defined
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            searchPatient(e.target.value);
                          }}
                        />
                      </FormControl>
                      {isSearching && (
                        <div className="absolute right-3 top-9">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          className="pl-4 h-12 text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Personal Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="pl-4 h-12 text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="pl-4 h-12 text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Date of Birth
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date(1900, 0, 1)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Appointment Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Doctor</FormLabel>
                      <Select onValueChange={handleDoctorSelect}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Choose doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem
                              key={doctor._id}
                              value={doctor._id.toString()}
                            >
                              Dr. {doctor.firstName} {doctor.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleDateSelect}
                            disabled={(date) =>
                              date < new Date() ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(availableSlots) &&
                          availableSlots.length > 0 ? (
                            availableSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {format(
                                  parse(time, "HH:mm", new Date()),
                                  "h:mm a"
                                )}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-slots" disabled>
                              No available slots
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
