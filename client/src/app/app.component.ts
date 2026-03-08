import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserSelectorComponent } from './components/user-selector/user-selector.component';
import { ClockWidgetComponent } from './components/clock-widget/clock-widget.component';
import { RecordsListComponent } from './components/records-list/records-list.component';
import { ReportViewComponent } from './components/report-view/report-view.component';
import { WorkScheduleConfigComponent } from './components/work-schedule-config/work-schedule-config.component';
import { ToastComponent } from './components/toast/toast.component';
import { User } from './services/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserSelectorComponent,
    ClockWidgetComponent,
    RecordsListComponent,
    ReportViewComponent,
    WorkScheduleConfigComponent,
    ToastComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-toast></app-toast>
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-8">
              <h1 class="text-xl font-semibold text-slate-800">Time Recording</h1>
              <nav class="hidden md:flex gap-1">
                <button
                  (click)="setView('dashboard')"
                  [class]="getNavClass('dashboard')"
                >
                  Dashboard
                </button>
                <button
                  (click)="setView('records')"
                  [class]="getNavClass('records')"
                >
                  Records
                </button>
                <button
                  (click)="setView('report')"
                  [class]="getNavClass('report')"
                >
                  Report
                </button>
                <button
                  (click)="setView('schedule')"
                  [class]="getNavClass('schedule')"
                >
                  Schedule
                </button>
              </nav>
            </div>

            <app-user-selector (userSelected)="onUserSelected($event)"></app-user-selector>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Dashboard View (default) -->
        <div *ngIf="currentView === 'dashboard'" class="grid gap-6">
          <div class="grid md:grid-cols-2 gap-6">
            <app-clock-widget [userId]="currentUser?.id ?? null"></app-clock-widget>
            <app-work-schedule-config [userId]="currentUser?.id ?? null"></app-work-schedule-config>
          </div>
          <app-records-list [userId]="currentUser?.id ?? null"></app-records-list>
        </div>

        <!-- Records View -->
        <div *ngIf="currentView === 'records'" class="space-y-6">
          <app-records-list [userId]="currentUser?.id ?? null"></app-records-list>
        </div>

        <!-- Report View -->
        <div *ngIf="currentView === 'report'" class="space-y-6">
          <app-report-view [userId]="currentUser?.id ?? null" [activeView]="currentView"></app-report-view>
        </div>

        <!-- Schedule View -->
        <div *ngIf="currentView === 'schedule'" class="space-y-6">
          <app-work-schedule-config [userId]="currentUser?.id ?? null"></app-work-schedule-config>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  currentUser: User | null = null;
  currentView = 'dashboard';

  constructor(private router: Router) {}

  onUserSelected(user: User | null) {
    this.currentUser = user;
  }

  setView(view: string) {
    this.currentView = view;
  }

  getNavClass(view: string): string {
    const base = 'px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ';
    if (this.currentView === view) {
      return base + 'bg-slate-100 text-slate-900';
    }
    return base + 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  }
}
