import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isVisible = false;
  technologies = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js'];
  displayedTitle = '';
  private fullTitle = '.NET Developer';
  private typingSpeed = 100; // milliseconds per character

  ngOnInit() {
    // Agregamos un pequeño delay para la animación inicial
    setTimeout(() => {
      this.isVisible = true;
      this.startTypingEffect();
    }, 500);
  }

  private startTypingEffect() {
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < this.fullTitle.length) {
        this.displayedTitle += this.fullTitle.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, this.typingSpeed);
  }

}
