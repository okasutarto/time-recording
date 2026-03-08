import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Report } from '../../services/types';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-800">Report</h2>

            <div *ngIf="userId" class="flex items-center gap-2">
              <input
                type="date"
                [(ngModel)]="startDate"
                class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-slate-400">to</span>
              <input
                type="date"
                [(ngModel)]="endDate"
                class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                (click)="loadReport()"
                [disabled]="loading"
                class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          <div *ngIf="userId" class="flex items-center gap-2 flex-wrap">
            <button
              (click)="setPreset('today')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              [class]="getPresetClass('today')"
            >
              Today
            </button>
            <button
              (click)="setPreset('last7')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              [class]="getPresetClass('last7')"
            >
              Last 7 days
            </button>
            <button
              (click)="setPreset('last30')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              [class]="getPresetClass('last30')"
            >
              Last 30 days
            </button>
            <button
              (click)="setPreset('thisMonth')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              [class]="getPresetClass('thisMonth')"
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!userId" class="p-6 text-slate-400 text-center">
        Select a user to view reports
      </div>

      <div *ngIf="userId && !report && !loading" class="p-6 text-slate-400 text-center">
        Select a date range and click Generate
      </div>

      <div *ngIf="loading" class="p-6 text-center">
        <svg class="animate-spin h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="report">
        <!-- Summary -->
        <div class="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-100">
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-800">{{ report.summary.total_worked_hours.toFixed(1) }}</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Hours</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold" [class]="report.summary.total_overtime_hours > 0 ? 'text-amber-600' : 'text-slate-800'">
              {{ report.summary.total_overtime_hours.toFixed(1) }}
            </div>
            <div class="text-xs text-slate-500 uppercase tracking-wide mt-1">Overtime</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-800">{{ report.summary.number_of_days_worked }}</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide mt-1">Days Worked</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-slate-800">{{ report.summary.number_of_working_days }}</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide mt-1">Working Days</div>
          </div>
        </div>

        <!-- Daily Breakdown -->
        <div class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          <div
            *ngFor="let day of report.daily_breakdown"
            class="px-6 py-3 flex items-center justify-between hover:bg-slate-50"
          >
            <div>
              <div class="text-sm font-medium text-slate-700">
                {{ formatDate(day.date) }}
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                <span *ngIf="day.clock_in">{{ formatTime(day.clock_in) }}</span>
                <span *ngIf="day.clock_in && day.clock_out"> - </span>
                <span *ngIf="day.clock_out">{{ formatTime(day.clock_out) }}</span>
                <span *ngIf="!day.clock_in">No record</span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div *ngIf="day.is_working_day" class="text-right">
                <div class="text-sm font-medium" [class]="day.overtime_hours > 0 ? 'text-amber-600' : 'text-slate-700'">
                  {{ day.worked_hours.toFixed(2) }}h
                </div>
                <div *ngIf="day.overtime_hours > 0" class="text-xs text-amber-500">
                  +{{ day.overtime_hours.toFixed(2) }}h overtime
                </div>
              </div>
              <div *ngIf="!day.is_working_day" class="text-right">
                <span class="text-xs text-slate-400 uppercase">Day off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportViewComponent implements OnChanges {
  @Input() userId: number | null = null;
  @Input() activeView: string = '';

  report: Report | null = null;
  loading = false;

  startDate = '';
  endDate = '';
  activePreset = 'last7';

  constructor(private api: ApiService) {
    this.setDefaultDates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId']) {
      this.report = null;
    }
    // Auto-generate report when switching to report view
    if (changes['activeView'] && this.activeView === 'report' && this.userId) {
      this.loadReport();
    }
  }

  setDefaultDates() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = weekAgo.toISOString().split('T')[0];
  }

  setPreset(preset: string) {
    const today = new Date();
    this.activePreset = preset;

    switch (preset) {
      case 'today':
        this.startDate = today.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'last7':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'last30':
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        this.startDate = monthAgo.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = firstDay.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];
        break;
    }

    // Auto-generate report when preset is clicked
    if (this.userId) {
      this.loadReport();
    }
  }

  getPresetClass(preset: string): string {
    if (this.activePreset === preset) {
      return 'bg-blue-600 text-white';
    }
    return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
  }

  loadReport() {
    if (!this.userId || !this.startDate || !this.endDate) return;

    this.loading = true;
    this.api.getReport(this.userId, this.startDate, this.endDate).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load report:', err);
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
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
}
