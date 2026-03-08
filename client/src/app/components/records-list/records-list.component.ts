import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ScheduleService } from '../../services/schedule.service';
import { TimeRecord } from '../../services/types';

@Component({
  selector: 'app-records-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Time Records</h2>
      </div>

      <div *ngIf="!userId" class="p-6 text-slate-400 text-center">
        Select a user to view records
      </div>

      <div *ngIf="userId && records.length === 0 && !loading" class="p-6 text-slate-400 text-center">
        No time records found
      </div>

      <div *ngIf="loading" class="p-6 text-center">
        <svg class="animate-spin h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="records.length > 0" class="divide-y divide-slate-100">
        <div
          *ngFor="let record of records"
          class="px-6 py-4 hover:bg-slate-50 transition-colors duration-150"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-500">
                {{ formatDate(record.clock_in) }}
              </div>
              <div class="mt-1">
                <span class="text-slate-700 font-medium">
                  {{ formatTime(record.clock_in) }}
                </span>
                <span class="text-slate-400 mx-2">→</span>
                <span *ngIf="record.clock_out" class="text-slate-700 font-medium">
                  {{ formatTime(record.clock_out) }}
                </span>
                <span *ngIf="!record.clock_out" class="text-emerald-600 font-medium">
                  Currently working
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold" [class]="record.clock_out ? 'text-slate-700' : 'text-emerald-600'">
                {{ calculateHours(record) }}
              </div>
              <div class="text-xs text-slate-400 uppercase tracking-wide">
                duration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecordsListComponent implements OnChanges, OnDestroy {
  @Input() userId: number | null = null;

  records: TimeRecord[] = [];
  loading = false;
  private clockSubscription?: Subscription;

  constructor(
    private api: ApiService,
    private scheduleService: ScheduleService
  ) {
    this.clockSubscription = this.scheduleService.onClockChanged().subscribe(() => {
      if (this.userId) {
        this.loadRecords();
      }
    });
  }

  ngOnDestroy() {
    this.clockSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && this.userId) {
      this.loadRecords();
    } else if (changes['userId'] && !this.userId) {
      this.records = [];
    }
  }

  loadRecords() {
    if (!this.userId) return;
    this.loading = true;
    this.api.getRecords(this.userId).subscribe({
      next: (records) => {
        this.records = records.sort((a, b) =>
          new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load records:', err);
        this.loading = false;
      }
    });
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  calculateHours(record: TimeRecord): string {
    if (!record.clock_out) return '-';

    const start = new Date(record.clock_in);
    const end = new Date(record.clock_out);
    const totalSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }
}
