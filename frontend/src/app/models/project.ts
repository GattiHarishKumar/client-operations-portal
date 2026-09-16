export type ProjectStatus = 'Planning' | 'In-Progress' | 'Review' | 'Completed';

export interface Project {
  id?: number;
  clientId: number;
  title: string;
  budget: number;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  clientName?: string;
  companyName?: string;
}
