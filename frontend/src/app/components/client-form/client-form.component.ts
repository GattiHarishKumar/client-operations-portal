import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);

  submitted = false;
  successMessage = '';
  errorMessage = '';

  readonly clientForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    companyName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    portfolioUrl: ['', Validators.pattern(/^https?:\/\/.+/i)]
  });

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.clientForm.invalid) return;

    this.clientService.createClient(this.clientForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Client registered successfully!';
        this.clientForm.reset();
        this.submitted = false;
        setTimeout(() => this.router.navigate(['/clients']), 900);
      },
      error: (err) => {
        this.errorMessage = err?.error?.error ?? 'Unable to register client. Please try again.';
      }
    });
  }
}
