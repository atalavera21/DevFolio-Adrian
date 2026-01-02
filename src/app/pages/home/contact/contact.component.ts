import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private http = inject(HttpClient);

  readonly contactInfo = {
    email: 'atalavera.0596@gmail.com',
    linkedin: 'https://www.linkedin.com/in/adriantalavera-dev/',
    github: 'https://github.com/atalavera21'
  };

  // Estado del formulario
  formData: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitStatus: 'idle' | 'success' | 'error' = 'idle';
  statusMessage = '';

  async onSubmit(): Promise<void> {
    // Validación básica
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.showStatus('error', 'Por favor completa todos los campos requeridos');
      return;
    }

    this.isSubmitting = true;
    this.submitStatus = 'idle';

    try {
      const response = await this.http
        .post<ApiResponse>('/api/SaveContactMessage', this.formData)
        .toPromise();

      if (response?.success) {
        this.showStatus('success', '¡Mensaje enviado correctamente! Te responderé lo antes posible.');
        this.resetForm();
      } else {
        this.showStatus('error', response?.error || 'Error al enviar el mensaje');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      
      if (error.status === 0) {
        this.showStatus('error', 'Error de conexión. Por favor intenta de nuevo.');
      } else if (error.status === 400) {
        this.showStatus('error', error.error?.error || 'Datos inválidos');
      } else {
        this.showStatus('error', 'Error al enviar el mensaje. Por favor intenta de nuevo.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  private showStatus(status: 'success' | 'error', message: string): void {
    this.submitStatus = status;
    this.statusMessage = message;

    // Auto-ocultar mensaje después de 5 segundos
    setTimeout(() => {
      this.submitStatus = 'idle';
      this.statusMessage = '';
    }, 5000);
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}