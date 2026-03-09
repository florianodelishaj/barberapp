"use client";

import { useRef, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import itLocale from "@fullcalendar/core/locales/it";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import { useAppointments } from "@/hooks/use-appointments";
import type { Appointment } from "@/lib/types";
import { CalendarNav } from "./calendar-nav";
import { AppointmentView } from "./appointment-view";
import { BlockSlotForm } from "./block-slot-form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function CalendarView() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [viewedDate, setViewedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("timeGridDay");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentViewOpen, setAppointmentViewOpen] = useState(false);
  const [blockSlotOpen, setBlockSlotOpen] = useState(false);

  const { events, updateAppointmentStatus, createManualBlock } =
    useAppointments(dateRange);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setViewedDate(arg.view.currentStart);
    setDateRange({ start: arg.start, end: arg.end });
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const apt = info.event.extendedProps.appointment as Appointment;
    setSelectedAppointment(apt);
    setAppointmentViewOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: "completed" | "cancelled") => {
      await updateAppointmentStatus(id, status);
      toast.success(
        status === "completed" ? "Appuntamento completato" : "Appuntamento cancellato"
      );
    },
    [updateAppointmentStatus]
  );

  const handleCreateBlock = useCallback(
    async (block: {
      barber_id: string;
      scheduled_at: string;
      duration_minutes: number;
      note: string;
      service_id?: string;
      user_id?: string;
      price: number;
    }) => {
      await createManualBlock(block);
      toast.success("Slot bloccato");
    },
    [createManualBlock]
  );

  return (
    <div className="space-y-4">
      <CalendarNav
        calendarRef={calendarRef}
        viewedDate={viewedDate}
        currentView={currentView}
        onViewChange={setCurrentView}
        onBlockSlot={() => setBlockSlotOpen(true)}
      />

      <Card className="p-3 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridDay"
          locale={itLocale}
          headerToolbar={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          firstDay={1}
          height="calc(100vh - 220px)"
          contentHeight="auto"
          expandRows={true}
          nowIndicator={true}
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventContent={(info) => {
            const durationMin = info.event.end && info.event.start
              ? (info.event.end.getTime() - info.event.start.getTime()) / 60000
              : 60;
            return (
              <div className={`overflow-hidden px-1.5 w-full h-full flex ${durationMin <= 60 ? "items-center" : "items-start pt-0.5"}`}>
                <p className={`font-semibold leading-tight truncate w-full ${durationMin <= 25 ? "text-[9px]" : "text-xs"}`}>
                  {info.event.title}
                </p>
              </div>
            );
          }}
          dayHeaderContent={(info) => (
            <div className="flex flex-col items-center py-1">
              <span className="text-xs text-muted-foreground capitalize">
                {info.date.toLocaleDateString("it-IT", { weekday: "short" })}
              </span>
              <span
                className={`text-sm font-medium mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                  info.isToday ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {info.date.getDate()}
              </span>
            </div>
          )}
        />
      </Card>

      <AppointmentView
        appointment={selectedAppointment}
        open={appointmentViewOpen}
        onOpenChange={setAppointmentViewOpen}
        onStatusChange={handleStatusChange}
      />

      <BlockSlotForm
        open={blockSlotOpen}
        onOpenChange={setBlockSlotOpen}
        onSubmit={handleCreateBlock}
      />
    </div>
  );
}
