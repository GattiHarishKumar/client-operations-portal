import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/meetings`;

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.apiUrl);
  }

  scheduleMeeting(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(this.apiUrl, meeting);
  }

  deleteMeeting(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
