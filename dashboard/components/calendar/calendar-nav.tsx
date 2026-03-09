"use client";

import type FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, GalleryVertical, Tally3, Table, Plus, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface CalendarNavProps {
  calendarRef: RefObject<FullCalendar | null>;
  viewedDate: Date;
  currentView: string;
  onViewChange: (view: string) => void;
  onBlockSlot: () => void;
}

export function CalendarNav({
  calendarRef,
  viewedDate,
  currentView,
  onViewChange,
  onBlockSlot,
}: CalendarNavProps) {
  function getApi() {
    return calendarRef.current?.getApi();
  }

  function goPrev() {
    getApi()?.prev();
  }

  function goNext() {
    getApi()?.next();
  }

  function goToday() {
    getApi()?.today();
  }

  function changeView(view: string) {
    getApi()?.changeView(view);
    onViewChange(view);
  }

  const dateInputRef = useRef<HTMLInputElement>(null);

  function handleDatePick(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!value) return;
    getApi()?.gotoDate(new Date(value + "T00:00:00"));
  }

  const dateLabel =
    currentView === "timeGridDay"
      ? format(viewedDate, "EEEE d MMMM yyyy", { locale: it })
      : currentView === "timeGridWeek"
      ? format(viewedDate, "MMMM yyyy", { locale: it })
      : format(viewedDate, "MMMM yyyy", { locale: it });

  const todayLabel =
    currentView === "timeGridDay"
      ? "Oggi"
      : currentView === "timeGridWeek"
      ? "Questa settimana"
      : "Questo mese";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Date navigation */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={goPrev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-1.5 text-sm font-medium min-w-40 justify-center capitalize px-2 py-1 rounded-md hover:bg-accent/10 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            {dateLabel}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={format(viewedDate, "yyyy-MM-dd")}
            onChange={handleDatePick}
            className="absolute inset-0 opacity-0 pointer-events-none w-full"
            tabIndex={-1}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={goNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
          {todayLabel}
        </Button>

        {/* View switcher */}
        <Tabs value={currentView} onValueChange={changeView}>
          <TabsList className="h-8">
            <TabsTrigger value="timeGridDay" className="px-2 h-6">
              <GalleryVertical className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs hidden sm:inline">Giorno</span>
            </TabsTrigger>
            <TabsTrigger value="timeGridWeek" className="px-2 h-6">
              <Tally3 className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs hidden sm:inline">Settimana</span>
            </TabsTrigger>
            <TabsTrigger value="dayGridMonth" className="px-2 h-6">
              <Table className="w-3.5 h-3.5" />
              <span className="ml-1 text-xs hidden sm:inline">Mese</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Block slot button */}
        <Button size="sm" onClick={onBlockSlot} className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Blocca slot
        </Button>
      </div>
    </div>
  );
}
