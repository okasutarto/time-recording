import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: Toast[] = [];
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.push(toast);
    this.toasts$.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error', 8000);
  }

  info(message: string) {
    this.show(message, 'info');
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toasts$.next([...this.toasts]);
  }

  getToasts() {
    return this.toasts$.asObservable();
  }
}
