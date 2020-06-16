import { Component } from '@angular/core';
import { ThemeService } from './layout/theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Spring Cloud Data Flow';

  darkThemeIsActive = false;
  isAboutOpen = false;

  constructor(
    private themeService: ThemeService
  ) { }

  toggleDarkTheme() {
    if (this.darkThemeIsActive) {
      this.themeService.switchTheme('default');
      this.darkThemeIsActive = false;
    } else {
      this.themeService.switchTheme('dark');
      this.darkThemeIsActive = true;
    }
  }

  toggleAbout() {
    this.isAboutOpen = !this.isAboutOpen;
  }
}
