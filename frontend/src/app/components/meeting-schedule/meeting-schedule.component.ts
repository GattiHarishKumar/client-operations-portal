import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { MeetingService } from '../../services/meeting.service';
import { Client } from '../../models/client';
import { Meeting } from '../../models/meeting';

export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  return selectedDate > new Date() ? null : { pastDate: true };
}

@Component({
  selector: 'app-meeting-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meeting-schedule.component.html',
  styleUrls: ['./meeting-schedule.component.css']
})
export class MeetingScheduleComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly meetingService = inject(MeetingService);

  clients: Client[] = [];
  meetings: Meeting[] = [];
  submitted = false;
  loading = true;
  successMessage = '';
  errorMessage = '';

  readonly meetingForm = this.fb.nonNullable.group({
    clientId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    meetingDate: ['', [Validators.required, futureDateValidator]],
    location: ['Virtual / Google Meet', Validators.required],
    agenda: ['', [Validators.required, Validators.maxLength(500)]],
    status: ['Scheduled' as const]
  });

  ngOnInit(): void {
    this.loadClients();
    this.loadMeetings();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: data => this.clients = data,
      error: err => this.errorMessage = err?.error?.error ?? 'Failed to load clients.'
    });
  }

  loadMeetings(): void {
    this.meetingService.getMeetings().subscribe({
      next: data => {
        this.meetings = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.error ?? 'Failed to load meetings.';
        this.loading = false;
      }
    });
  }

  getClientName(clientId: number): string {
    const matched = this.clients.find(client => client.id === Number(clientId));
    return matched ? `${matched.name} (${matched.companyName})` : 'Unknown Client';
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.meetingForm.invalid) return;

    const raw = this.meetingForm.getRawValue();
    const payload: Meeting = {
      clientId: Number(raw.clientId),
      title: raw.title,
      meetingDate: raw.meetingDate,
      location: raw.location,
      agenda: raw.agenda,
      status: 'Scheduled'
    };

    this.meetingService.scheduleMeeting(payload).subscribe({
      next: created => {
        this.successMessage = 'Meeting scheduled successfully!';
        this.meetings = [...this.meetings, created].sort(
          (a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
        );
        this.meetingForm.reset({
          clientId: '',
          title: '',
          meetingDate: '',
          location: 'Virtual / Google Meet',
          agenda: '',
          status: 'Scheduled'
        });
        this.submitted = false;
      },
      error: err => {
        this.errorMessage = err?.error?.error ?? 'Unable to schedule meeting. Please try again.';
      }
    });
  }

  deleteMeeting(id?: number): void {
    if (!id) return;
    this.meetingService.deleteMeeting(id).subscribe({
      next: () => this.meetings = this.meetings.filter(meeting => meeting.id !== id),
      error: err => this.errorMessage = err?.error?.error ?? 'Unable to delete meeting.'
    });
  }
}
