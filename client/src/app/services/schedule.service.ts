import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private scheduleChanged$ = new BehaviorSubject<void>(undefined);
  private clockChanged$ = new BehaviorSubject<void>(undefined);

  notifyScheduleChanged() {
    this.scheduleChanged$.next();
  }

  onScheduleChanged() {
    return this.scheduleChanged$.asObservable();
  }

  notifyClockChanged() {
    this.clockChanged$.next();
  }

  onClockChanged() {
    return this.clockChanged$.asObservable();
  }
}
