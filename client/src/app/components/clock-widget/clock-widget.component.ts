import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ClockStatus, TimeRecord } from '../../services/types';

@Component({
  selector: 'app-clock-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div class="text-center">
        <div class="text-5xl font-light text-slate-800 mb-2 font-mono">
          {{ currentTime }}
        </div>
        <div class="text-slate-500 text-sm mb-6">
          {{ currentDate }}
        </div>

        <button
          *ngIf="userId"
          (click)="toggleClock()"
          [disabled]="loading"
          [class]="getButtonClass()"
        >
          <span class="flex items-center justify-center gap-3">
            <svg *ngIf="!loading" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!clockStatus?.is_clocked_in" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path *ngIf="clockStatus?.is_clocked_in" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg *ngIf="loading" class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Processing...' : (clockStatus?.is_clocked_in ? 'Clock Out' : 'Clock In') }}
          </span>
        </button>

        <div *ngIf="clockStatus?.current_record" class="mt-6 p-4 bg-slate-50 rounded-lg">
          <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Current Session</div>
          <div class="text-slate-700 font-medium">
            Started at {{ formatTime(clockStatus!.current_record!.clock_in) }}
          </div>
          <div class="text-sm text-slate-500 mt-1">
            {{ getElapsedTime(clockStatus!.current_record!.clock_in) }}
          </div>
        </div>

        <div *ngIf="!userId" class="mt-6 text-slate-400">
          Select a user to clock in/out
        </div>
      </div>
    </div>
  `
})
export class ClockWidgetComponent implements OnChanges, OnDestroy {
  @Input() userId: number | null = null;

  clockStatus: ClockStatus | null = null;
  loading = false;
  currentTime = '';
  currentDate = '';
  private timeInterval: any;

  constructor(private api: ApiService) {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && this.userId) {
      this.loadStatus();
    } else if (changes['userId'] && !this.userId) {
      this.clockStatus = null;
    }
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  loadStatus() {
    if (!this.userId) return;
    this.api.getClockStatus(this.userId).subscribe({
      next: (status) => (this.clockStatus = status),
      error: (err) => console.error('Failed to load clock status:', err)
    });
  }

  toggleClock() {
    if (!this.userId || this.loading) return;

    this.loading = true;
    const action = this.clockStatus?.is_clocked_in
      ? this.api.clockOut(this.userId)
      : this.api.clockIn(this.userId);

    action.subscribe({
      next: () => {
        this.loadStatus();
        this.loading = false;
      },
      error: (err) => {
        console.error('Clock action failed:', err);
        this.loading = false;
      }
    });
  }

  getButtonClass() {
    const base = 'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform ';
    if (this.clockStatus?.is_clocked_in) {
      return base + 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300';
    }
    return base + 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300';
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getElapsedTime(clockIn: string): string {
    const start = new Date(clockIn);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    return `Elapsed: ${hours}h ${minutes}m`;
  }
}
