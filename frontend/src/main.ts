import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ClientFormComponent } from './app/components/client-form/client-form.component';
import { ClientListComponent } from './app/components/client-list/client-list.component';
import { MeetingScheduleComponent } from './app/components/meeting-schedule/meeting-schedule.component';

const routes: Routes = [
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: 'clients', component: ClientListComponent },
  { path: 'clients/new', component: ClientFormComponent },
  { path: 'meetings', component: MeetingScheduleComponent },
  { path: '**', redirectTo: 'clients' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
