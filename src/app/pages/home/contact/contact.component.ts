import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  readonly contactInfo = {
    email: 'atalavera.0596@gmail.com',
    linkedin: 'https://www.linkedin.com/in/adriantalavera-dev/',
    github: 'https://github.com/atalavera21'
  };
}
