import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Client } from '../../models/client';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);

  clients: Client[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: data => {
        this.clients = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.error ?? 'Unable to load clients. Check that the API and database are running.';
        this.loading = false;
      }
    });
  }
}
