import { Component } from '@angular/core';
import { NewsHomeComponent } from './pages/news-home/news-home';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [NewsHomeComponent]
})
export class App {}
