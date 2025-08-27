"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  /** Current selected date value */
  value?: Date;
  /** Callback when date value changes */
  onChange?: (date: Date | undefined) => void;
  /** Whether the popover is open */
  open?: boolean;
  /** Callback when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Label text for the date picker */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Custom className for the trigger button */
  className?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  label = "Date of birth",
  placeholder = "Select date",
  showLabel = true,
  className,
  disabled = false,
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    undefined,
  );

  const isControlled = value !== undefined || onChange !== undefined;
  const isOpenControlled =
    controlledOpen !== undefined || controlledOnOpenChange !== undefined;

  // Use controlled values if provided, otherwise fall back to internal state
  const date = isControlled ? value : internalDate;
  const open = isOpenControlled ? (controlledOpen ?? false) : internalOpen;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (isControlled && onChange) {
      onChange(selectedDate);
    } else {
      setInternalDate(selectedDate);
    }

    const newOpenState = false;
    if (isOpenControlled && controlledOnOpenChange) {
      controlledOnOpenChange(newOpenState);
    } else {
      setInternalOpen(newOpenState);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isOpenControlled && controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {showLabel && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-48 justify-between font-normal ${className || ""}`}
            disabled={disabled}
          >
            {date ? date.toLocaleDateString() : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
