export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Meeting {
  id?: number;
  clientId: number;
  title: string;
  meetingDate: string;
  location: string;
  agenda: string;
  status: MeetingStatus;
  clientName?: string;
  companyName?: string;
}
