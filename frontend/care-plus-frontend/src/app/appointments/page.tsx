"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentList from "@/components/appointments/AppointmentList";

export default function AppointmentsPage() {
  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">New Appointment</TabsTrigger>
          <TabsTrigger value="list">Appointments List</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <AppointmentForm />
        </TabsContent>

        <TabsContent value="list">
          <AppointmentList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
