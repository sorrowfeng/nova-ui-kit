import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-3xl text-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button:
          "focus-ring m3-state-layer inline-flex size-8 items-center justify-center rounded-full bg-transparent text-sm text-primary hover:bg-primary/10",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 rounded-full text-[0.72rem] font-medium text-on-surface-variant",
        row: "mt-1 flex w-full",
        cell: "relative size-9 p-0 text-center text-sm",
        day: "focus-ring m3-state-layer size-9 rounded-full text-sm transition-colors hover:bg-primary/10 aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "bg-secondary-container text-secondary-container-foreground",
        day_outside: "text-on-surface-variant opacity-45",
        day_disabled: "text-on-surface-variant opacity-35",
        day_range_middle: "aria-selected:bg-secondary-container aria-selected:text-secondary-container-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
