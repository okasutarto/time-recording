import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  TimeRecord,
  ClockStatus,
  Report,
  WorkConfig,
  WorkScheduleInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateTimeRecordInput,
  UpdateWorkConfigInput
} from './types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/api/users/${id}`);
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/users`, input);
  }

  updateUser(id: number, input: UpdateUserInput): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/api/users/${id}`, input);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/users/${id}`);
  }

  // Clock
  clockIn(userId: number): Observable<TimeRecord> {
    return this.http.post<TimeRecord>(`${this.baseUrl}/api/clock/in/${userId}`, {});
  }

  clockOut(userId: number): Observable<TimeRecord> {
    return this.http.post<TimeRecord>(`${this.baseUrl}/api/clock/out/${userId}`, {});
  }

  getClockStatus(userId: number): Observable<ClockStatus> {
    return this.http.get<ClockStatus>(`${this.baseUrl}/api/clock/status/${userId}`);
  }

  // Records
  getRecords(userId: number): Observable<TimeRecord[]> {
    return this.http.get<TimeRecord[]>(`${this.baseUrl}/api/records/${userId}`);
  }

  getRecord(userId: number, id: number): Observable<TimeRecord> {
    return this.http.get<TimeRecord>(`${this.baseUrl}/api/records/${userId}/${id}`);
  }

  createRecord(input: { user_id: number; clock_in: string; clock_out?: string }): Observable<TimeRecord> {
    return this.http.post<TimeRecord>(`${this.baseUrl}/api/records`, input);
  }

  updateRecord(userId: number, id: number, input: UpdateTimeRecordInput): Observable<TimeRecord> {
    return this.http.put<TimeRecord>(`${this.baseUrl}/api/records/${userId}/${id}`, input);
  }

  deleteRecord(userId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/records/${userId}/${id}`);
  }

  // Reports
  getReport(userId: number, startDate: string, endDate: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/api/reports/${userId}`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  // Config
  getConfig(): Observable<WorkConfig> {
    return this.http.get<WorkConfig>(`${this.baseUrl}/api/config`);
  }

  updateConfig(input: UpdateWorkConfigInput): Observable<WorkConfig> {
    return this.http.put<WorkConfig>(`${this.baseUrl}/api/config`, input);
  }

  getSchedule(userId: number): Observable<{ day_of_week: number; is_working_day: boolean }[]> {
    return this.http.get<{ day_of_week: number; is_working_day: boolean }[]>(
      `${this.baseUrl}/api/config/schedule/${userId}`
    );
  }

  updateSchedule(userId: number, schedule: WorkScheduleInput[]): Observable<{ day_of_week: number; is_working_day: boolean }[]> {
    return this.http.put<{ day_of_week: number; is_working_day: boolean }[]>(
      `${this.baseUrl}/api/config/schedule/${userId}`,
      schedule
    );
  }
}
