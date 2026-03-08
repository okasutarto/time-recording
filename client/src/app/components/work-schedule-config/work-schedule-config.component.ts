import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface DaySchedule {
  day_of_week: number;
  day_name: string;
  is_working_day: boolean;
}

@Component({
  selector: 'app-work-schedule-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Work Schedule</h2>
      </div>

      <div *ngIf="!userId" class="p-6 text-slate-400 text-center">
        Select a user to configure schedule
      </div>

      <div *ngIf="loading" class="p-6 text-center">
        <svg class="animate-spin h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="userId && !loading && schedule.length > 0" class="p-6">
        <div class="grid grid-cols-7 gap-2">
          <div
            *ngFor="let day of schedule"
            (click)="toggleDay(day)"
            [class]="getDayClass(day)"
          >
            <div class="text-xs font-medium mb-1">{{ day.day_name }}</div>
            <div class="text-lg">
              {{ day.is_working_day ? '✓' : '✗' }}
            </div>
          </div>
        </div>

        <button
          (click)="saveSchedule()"
          [disabled]="saving"
          class="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
        >
          {{ saving ? 'Saving...' : 'Save Schedule' }}
        </button>

        <div *ngIf="autoClockedOut" class="mt-3 p-2 bg-amber-100 text-amber-700 text-sm rounded-lg text-center">
          You have been automatically clocked out (day changed to off)
        </div>
      </div>
    </div>
  `
})
export class WorkScheduleConfigComponent implements OnChanges {
  @Input() userId: number | null = null;

  schedule: DaySchedule[] = [];
  loading = false;
  saving = false;
  autoClockedOut = false;

  private dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && this.userId) {
      this.loadSchedule();
      this.autoClockedOut = false;
    } else if (changes['userId'] && !this.userId) {
      this.schedule = [];
    }
  }

  loadSchedule() {
    if (!this.userId) return;
    this.loading = true;

    this.api.getSchedule(this.userId).subscribe({
      next: (schedule) => {
        this.schedule = schedule.map(s => ({
          day_of_week: s.day_of_week,
          day_name: this.dayNames[s.day_of_week],
          is_working_day: s.is_working_day
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load schedule:', err);
        this.loading = false;
      }
    });
  }

  toggleDay(day: DaySchedule) {
    day.is_working_day = !day.is_working_day;
  }

  saveSchedule() {
    if (!this.userId) return;
    this.saving = true;
    this.autoClockedOut = false;

    // Check if user is clocked in on any day being changed to off
    const today = new Date().getDay();
    const todaySchedule = this.schedule.find(s => s.day_of_week === today);

    const schedule = this.schedule.map(d => ({
      day_of_week: d.day_of_week,
      is_working_day: d.is_working_day
    }));

    // If today is being changed to off, check if user is clocked in
    if (todaySchedule && !todaySchedule.is_working_day) {
      this.api.getClockStatus(this.userId).subscribe({
        next: (status) => {
          if (status.is_clocked_in) {
            // Auto clock out
            this.api.clockOut(this.userId!).subscribe({
              next: () => {
                this.autoClockedOut = true;
              },
              error: (err) => console.error('Failed to auto clock out:', err)
            });
          }
          this.finalizeSave(schedule);
        },
        error: (err) => {
          console.error('Failed to check clock status:', err);
          this.finalizeSave(schedule);
        }
      });
    } else {
      this.finalizeSave(schedule);
    }
  }

  finalizeSave(schedule: { day_of_week: number; is_working_day: boolean }[]) {
    this.api.updateSchedule(this.userId!, schedule).subscribe({
      next: () => {
        this.saving = false;
      },
      error: (err) => {
        console.error('Failed to save schedule:', err);
        this.saving = false;
      }
    });
  }

  getDayClass(day: DaySchedule): string {
    const base = 'p-3 rounded-lg text-center cursor-pointer transition-all duration-200 ';
    if (day.is_working_day) {
      return base + 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700';
    }
    return base + 'bg-slate-100 hover:bg-slate-200 text-slate-500';
  }
}
