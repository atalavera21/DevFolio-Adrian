import { Injectable, signal, PLATFORM_ID, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'portfolio-theme';
  private platformId = inject(PLATFORM_ID);
  public isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();

      // Effect to sync theme changes with DOM
      effect(() => {
        const isDark = this.isDarkMode();
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    }
  }

  private initializeTheme(): void {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.isDarkMode.set(isDark);

    if (isDark) {
      localStorage.setItem(this.THEME_KEY, 'dark');
    } else {
      localStorage.setItem(this.THEME_KEY, 'light');
    }
  }

  toggleTheme(): void {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, newValue ? 'dark' : 'light');
    }
  }
}
