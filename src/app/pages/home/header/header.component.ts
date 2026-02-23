import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  isVisible = false;
  displayedTitle = '';
  cvUrl = `${environment.apiUrl}/cv`;

  private titles = [
    '.NET Developer',
    'Full Stack Developer',
    'Backend Specialist',
    'Software Engineer'
  ];
  private currentTitleIndex = 0;
  private typingSpeed = 100;
  private deletingSpeed = 50;
  private pauseBetweenWords = 2000;
  private isDeleting = false;
  private timeoutId: any;

  ngOnInit() {
    setTimeout(() => {
      this.isVisible = true;
      this.typeEffect();
    }, 500);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private typeEffect() {
    const currentTitle = this.titles[this.currentTitleIndex];

    if (this.isDeleting) {
      // Borrando
      this.displayedTitle = currentTitle.substring(0, this.displayedTitle.length - 1);

      if (this.displayedTitle === '') {
        this.isDeleting = false;
        this.currentTitleIndex = (this.currentTitleIndex + 1) % this.titles.length;
        this.timeoutId = setTimeout(() => this.typeEffect(), 300);
        return;
      }
    } else {
      // Escribiendo
      this.displayedTitle = currentTitle.substring(0, this.displayedTitle.length + 1);

      if (this.displayedTitle === currentTitle) {
        // Pausa antes de borrar
        this.timeoutId = setTimeout(() => {
          this.isDeleting = true;
          this.typeEffect();
        }, this.pauseBetweenWords);
        return;
      }
    }

    const speed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
    this.timeoutId = setTimeout(() => this.typeEffect(), speed);
  }
}