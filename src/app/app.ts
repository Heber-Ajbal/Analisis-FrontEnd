import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UserbarComponent } from './shared/components/userbar/userbar.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
