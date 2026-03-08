import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ScheduleService } from '../../services/schedule.service';
import { TimeRecord, UpdateTimeRecordInput } from '../../services/types';

@Component({
  selector: 'app-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-800">Time Records</h2>
        <button
          *ngIf="userId"
          (click)="openCreateModal()"
          class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Record
        </button>
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
          *ngFor="let record of records; trackBy: trackByRecordId"
          class="px-6 py-4 hover:bg-slate-50 transition-colors duration-150"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
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
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-lg font-semibold" [class]="record.clock_out ? 'text-slate-700' : 'text-emerald-600'">
                  {{ calculateHours(record) }}
                </div>
                <div class="text-xs text-slate-400 uppercase tracking-wide">
                  duration
                </div>
              </div>
              <!-- Record Actions -->
              <div *ngIf="userId" class="flex items-center gap-1">
                <button
                  (click)="openEditModal(record)"
                  class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit record"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  (click)="confirmDelete(record)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete record"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Record Modal -->
    <div
      *ngIf="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      (click)="closeModal()"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Edit' : 'Add' }} Time Record</h3>
          <button
            (click)="closeModal()"
            class="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Clock In</label>
            <input
              type="datetime-local"
              [(ngModel)]="editClockIn"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Clock Out</label>
            <input
              type="datetime-local"
              [(ngModel)]="editClockOut"
              [min]="editClockIn"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-slate-500 mt-1">Leave empty for active/ongoing record</p>
          </div>
        </div>
        <div class="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            (click)="closeModal()"
            class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="saveRecord()"
            [disabled]="!editClockIn"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {{ isEditing ? 'Save Changes' : 'Add Record' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      *ngIf="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      (click)="showDeleteConfirm = false"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">Delete Record</h3>
          <button
            (click)="showDeleteConfirm = false"
            class="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <p class="text-slate-600">
            Are you sure you want to delete this time record?
          </p>
          <p class="text-sm text-slate-500 mt-2">
            {{ deletingRecord ? formatDate(deletingRecord.clock_in) + ' ' + formatTime(deletingRecord.clock_in) + ' - ' + (deletingRecord.clock_out ? formatTime(deletingRecord.clock_out) : 'ongoing') : '' }}
          </p>
        </div>
        <div class="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            (click)="showDeleteConfirm = false"
            class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="deleteRecord()"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
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

  // Modal state
  showModal = false;
  isEditing = false;
  editingRecordId: number | null = null;
  editClockIn = '';
  editClockOut = '';

  // Delete state
  showDeleteConfirm = false;
  deletingRecord: TimeRecord | null = null;

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

  trackByRecordId(index: number, record: TimeRecord): number {
    return record.id;
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

  // Modal methods
  openCreateModal() {
    this.isEditing = false;
    this.editingRecordId = null;
    this.editClockIn = '';
    this.editClockOut = '';
    this.showModal = true;
  }

  openEditModal(record: TimeRecord) {
    this.isEditing = true;
    this.editingRecordId = record.id;
    this.editClockIn = this.toDatetimeLocal(record.clock_in);
    this.editClockOut = record.clock_out ? this.toDatetimeLocal(record.clock_out) : '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingRecordId = null;
    this.editClockIn = '';
    this.editClockOut = '';
  }

  toDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  }

  saveRecord() {
    if (!this.userId || !this.editClockIn) return;

    const clockInIso = new Date(this.editClockIn).toISOString();
    const clockOutIso = this.editClockOut ? new Date(this.editClockOut).toISOString() : undefined;

    if (this.isEditing && this.editingRecordId) {
      // Update existing record
      const input: UpdateTimeRecordInput = {
        clock_in: clockInIso,
        clock_out: clockOutIso || null
      };
      this.api.updateRecord(this.userId, this.editingRecordId, input).subscribe({
        next: () => {
          this.loadRecords();
          this.closeModal();
          this.scheduleService.notifyClockChanged();
        },
        error: (err) => console.error('Failed to update record:', err)
      });
    } else {
      // Create new record
      const input = {
        user_id: this.userId,
        clock_in: clockInIso,
        clock_out: clockOutIso
      };
      this.api.createRecord(input).subscribe({
        next: () => {
          this.loadRecords();
          this.closeModal();
          this.scheduleService.notifyClockChanged();
        },
        error: (err) => console.error('Failed to create record:', err)
      });
    }
  }

  // Delete methods
  confirmDelete(record: TimeRecord) {
    this.deletingRecord = record;
    this.showDeleteConfirm = true;
  }

  deleteRecord() {
    if (!this.userId || !this.deletingRecord) return;

    this.api.deleteRecord(this.userId, this.deletingRecord.id).subscribe({
      next: () => {
        this.loadRecords();
        this.showDeleteConfirm = false;
        this.deletingRecord = null;
        this.scheduleService.notifyClockChanged();
      },
      error: (err) => console.error('Failed to delete record:', err)
    });
  }
}
