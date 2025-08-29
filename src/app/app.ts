import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { UserbarComponent } from './userbar.component'; // 👈 importa tu userbar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    UserbarComponent  // 👈 agréga aquí tu componente
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
