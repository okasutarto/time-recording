import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User, CreateUserInput, UpdateUserInput } from '../../services/types';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-4">
      <div class="relative">
        <select
          [(ngModel)]="selectedUserId"
          (ngModelChange)="onUserSelected()"
          class="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[200px] transition-all duration-200"
        >
          <option [ngValue]="null" disabled>Select a user</option>
          <option *ngFor="let user of users" [ngValue]="user.id">
            {{ user.name }}
          </option>
        </select>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- User Actions -->
      <div *ngIf="selectedUserId" class="flex items-center gap-2">
        <button
          (click)="openEditModal()"
          class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit user"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          (click)="confirmDelete()"
          class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete user"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <button
        (click)="showCreateForm = true"
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        + New User
      </button>
    </div>

    <!-- Create User Modal -->
    <div
      *ngIf="showCreateForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      (click)="closeModal()"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">Create New User</h3>
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
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              [(ngModel)]="newUserName"
              placeholder="Enter name"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            (click)="createUser()"
            [disabled]="!newUserName"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Create User
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      *ngIf="showEditForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      (click)="closeEditModal()"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-lg font-semibold text-slate-800">Edit User</h3>
          <button
            (click)="closeEditModal()"
            class="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              [(ngModel)]="editUserName"
              placeholder="Enter name"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            (click)="closeEditModal()"
            class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="updateUser()"
            [disabled]="!editUserName"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Save Changes
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
          <h3 class="text-lg font-semibold text-slate-800">Delete User</h3>
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
            Are you sure you want to delete <strong>{{ getSelectedUserName() }}</strong>?
            This will also delete all their time records.
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
            (click)="deleteUser()"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class UserSelectorComponent implements OnInit {
  @Output() userSelected = new EventEmitter<User | null>();

  users: User[] = [];
  selectedUserId: number | null = null;
  showCreateForm = false;
  showEditForm = false;
  showDeleteConfirm = false;
  newUserName = '';
  editUserName = '';
  editingUserId: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  onUserSelected() {
    if (this.selectedUserId) {
      const user = this.users.find(u => u.id === this.selectedUserId);
      this.userSelected.emit(user || null);
    } else {
      this.userSelected.emit(null);
    }
  }

  getSelectedUserName(): string {
    const user = this.users.find(u => u.id === this.selectedUserId);
    return user?.name || '';
  }

  closeModal() {
    this.showCreateForm = false;
    this.newUserName = '';
  }

  openEditModal() {
    if (!this.selectedUserId) return;
    const user = this.users.find(u => u.id === this.selectedUserId);
    if (user) {
      this.editUserName = user.name;
      this.editingUserId = user.id;
      this.showEditForm = true;
    }
  }

  closeEditModal() {
    this.showEditForm = false;
    this.editUserName = '';
    this.editingUserId = null;
  }

  confirmDelete() {
    if (this.selectedUserId) {
      this.showDeleteConfirm = true;
    }
  }

  createUser() {
    if (!this.newUserName) return;

    const input: CreateUserInput = {
      name: this.newUserName
    };

    this.api.createUser(input).subscribe({
      next: (user) => {
        this.users.push(user);
        this.selectedUserId = user.id;
        this.closeModal();
        this.onUserSelected();
      },
      error: (err) => console.error('Failed to create user:', err)
    });
  }

  updateUser() {
    if (!this.editUserName || !this.editingUserId) return;

    const input: UpdateUserInput = {
      name: this.editUserName
    };

    this.api.updateUser(this.editingUserId, input).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.closeEditModal();
        this.onUserSelected();
      },
      error: (err) => console.error('Failed to update user:', err)
    });
  }

  deleteUser() {
    if (!this.selectedUserId) return;

    this.api.deleteUser(this.selectedUserId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.selectedUserId);
        this.selectedUserId = null;
        this.showDeleteConfirm = false;
        this.userSelected.emit(null);
      },
      error: (err) => console.error('Failed to delete user:', err)
    });
  }
}
