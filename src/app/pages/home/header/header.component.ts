import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  isVisible = false;
  technologies = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js'];

  ngOnInit() {
    // Agregamos un pequeño delay para la animación inicial
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  }
  
}
