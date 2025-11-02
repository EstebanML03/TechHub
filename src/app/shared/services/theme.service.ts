import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>('light');
  private systemPrefersDark: MediaQueryList;

  constructor() {
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initTheme();
    this.watchSystemTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }
  }

  private watchSystemTheme(): void {
    this.systemPrefersDark.addEventListener('change', (e) => {
      if (this.currentTheme$.value === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme$.next(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'auto') {
      this.applyTheme(this.systemPrefersDark.matches ? 'dark' : 'light');
    } else {
      this.applyTheme(theme);
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
    }

    // Actualizar meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }

  getTheme(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }

  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  getAppliedTheme(): 'light' | 'dark' {
    const currentTheme = this.currentTheme$.value;
    if (currentTheme === 'auto') {
      return this.systemPrefersDark.matches ? 'dark' : 'light';
    }
    return currentTheme;
  }

  toggleTheme(): void {
    const current = this.currentTheme$.value;
    if (current === 'light') {
      this.setTheme('dark');
    } else if (current === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }
}
