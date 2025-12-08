/**
 * @file components/wholesaler/Orders/OrderDateRangePicker.tsx
 * @description 주문 날짜 범위 선택 컴포넌트
 *
 * react-day-picker를 사용한 날짜 범위 선택 UI입니다.
 *
 * @dependencies
 * - react-day-picker
 * - components/ui/calendar.tsx
 * - components/ui/popover.tsx
 * - components/ui/button.tsx
 * - date-fns
 */

"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OrderDateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export default function OrderDateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
}: OrderDateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "min-w-[200px] max-w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <span className="flex-1 truncate">
                  {format(dateRange.from, "yyyy-MM-dd", { locale: ko })} ~{" "}
                  {format(dateRange.to, "yyyy-MM-dd", { locale: ko })}
                </span>
              ) : (
                <span className="flex-1 truncate">
                  {format(dateRange.from, "yyyy-MM-dd", { locale: ko })}
                </span>
              )
            ) : (
              <span className="flex-1 truncate">조회 기간 설정</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

