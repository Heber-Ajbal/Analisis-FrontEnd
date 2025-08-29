import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-review',
  standalone: true,
  template: `
  <div class="min-h-[60svh] bg-[#0F1424] text-white p-6 grid place-items-center">
    <div class="w-full max-w-2xl bg-[#0e1428] border border-white/15 rounded-2xl p-6 space-y-4">
      <h2 class="text-xl font-semibold">Revisión manual en curso</h2>
      <div class="grid grid-cols-3 gap-3">
        <div class="border border-white/15 rounded-xl p-3"><b>Usuario</b><br>admin@empresa.com</div>
        <div class="border border-white/15 rounded-xl p-3"><b>Tipo</b><br>empresa</div>
        <div class="border border-white/15 rounded-xl p-3"><b>Estado</b><br><span class="text-amber-300">Pendiente</span></div>
      </div>
      <p>Cuando sea aprobado, se habilita el <b>Panel de Empresa</b>.</p>
      <div class="flex gap-2">
        <a routerLink="/login" class="btn-ghost">Salir</a>
        <button class="btn-primary" (click)="simular()">Simular aprobación</button>
      </div>
    </div>
  </div>
  `
})
export class ReviewComponent {
  constructor(private router: Router){}
  simular(){ this.router.navigateByUrl('/admin'); }
}
