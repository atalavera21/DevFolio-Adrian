import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isVisible = false;
  displayedTitle = '';
  cvUrl = `${environment.apiUrl}/cv`;
  
  private fullTitle = '.NET Developer';
  private typingSpeed = 100;

  ngOnInit() {
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