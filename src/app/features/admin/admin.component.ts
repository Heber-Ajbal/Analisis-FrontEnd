import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface KpiTile {
  label: string;
  value: number;
  icon: string;
  variation: number;
}

interface RoleRow {
  name: string;
  users: number;
  permissions: string[];
  status: 'activo' | 'revision' | 'suspendido';
}

interface AuditEntry {
  module: string;
  action: string;
  user: string;
  timestamp: string;
  severity: 'alta' | 'media' | 'baja';
}

interface ApprovalItem {
  title: string;
  requester: string;
  detail: string;
  submittedAt: string;
}

interface PolicyToggle {
  name: string;
  description: string;
  lastReview: string;
  enabled: boolean;
}

interface TaskItem {
  title: string;
  owner: string;
  deadline: string;
  progress: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatTableModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  readonly kpis = signal<KpiTile[]>([
    { label: 'Usuarios activos', value: 128, icon: 'groups', variation: 12 },
    { label: 'Roles definidos', value: 14, icon: 'badge', variation: 3 },
    { label: 'Bitácoras revisadas', value: 312, icon: 'history_edu', variation: 18 },
    { label: 'Alertas resueltas', value: 27, icon: 'verified_user', variation: 9 },
  ]);

  readonly securitySnapshot = signal({
    compliance: 82,
    incidents: 3,
    lastAudit: 'Hace 12 horas',
    nextAudit: '08 Jul 2024 - 09:00 hrs',
  });

  readonly governanceScore = computed(() => 96);

  readonly roles = signal<RoleRow[]>([
    {
      name: 'Administrador General',
      users: 6,
      permissions: ['Inventario', 'Ventas', 'Publicidad', 'Usuarios', 'KPIs'],
      status: 'activo',
    },
    {
      name: 'Gerencia Comercial',
      users: 9,
      permissions: ['Ventas', 'Compras', 'Reportes', 'Campañas'],
      status: 'activo',
    },
    {
      name: 'Coordinador de Inventario',
      users: 11,
      permissions: ['Inventario', 'Proveedores', 'Movimientos'],
      status: 'revision',
    },
    {
      name: 'Aliados - Mayoristas',
      users: 17,
      permissions: ['Catálogo', 'Promociones personalizadas'],
      status: 'revision',
    },
    {
      name: 'Soporte Técnico',
      users: 4,
      permissions: ['Tickets', 'Bitácora', 'Alertas'],
      status: 'activo',
    },
    {
      name: 'Consultor Contable',
      users: 2,
      permissions: ['KPIs financieros', 'Exportaciones'],
      status: 'suspendido',
    },
  ]);

  readonly auditTrail = signal<AuditEntry[]>([
    {
      module: 'Inventario',
      action: 'Ajuste masivo de existencias (+350)',
      user: 'Laura Méndez',
      timestamp: 'Hace 8 minutos',
      severity: 'alta',
    },
    {
      module: 'Publicidad',
      action: 'Creación campaña "Promo motores 2T"',
      user: 'Andrés Silva',
      timestamp: 'Hace 24 minutos',
      severity: 'media',
    },
    {
      module: 'Comisiones',
      action: 'Actualización de porcentajes zona norte',
      user: 'María Zamora',
      timestamp: 'Hace 1 hora',
      severity: 'media',
    },
    {
      module: 'Clientes',
      action: 'Exportación de base segmentada',
      user: 'Alejandro Ruiz',
      timestamp: 'Hace 2 horas',
      severity: 'baja',
    },
  ]);

  readonly approvals = signal<ApprovalItem[]>([
    {
      title: 'Permiso temporal para edición de catálogos',
      requester: 'Carlos Fonseca',
      detail: 'Solicita acceso al módulo de proveedores por 48h',
      submittedAt: 'Hace 35 minutos',
    },
    {
      title: 'Solicitud de publicación de campaña regional',
      requester: 'Jessica Gómez',
      detail: 'Campaña display para zona occidente',
      submittedAt: 'Hace 1 hora',
    },
    {
      title: 'Revisión de tope de comisión',
      requester: 'Diego Martínez',
      detail: 'Incremento de comisión para vendedores premium',
      submittedAt: 'Hace 3 horas',
    },
  ]);

  readonly policies = signal<PolicyToggle[]>([
    {
      name: 'Doble factor de autenticación',
      description: 'Requiere OTP en cada inicio administrativo',
      lastReview: '05 Jul 2024',
      enabled: true,
    },
    {
      name: 'Captcha en accesos sensibles',
      description: 'Habilitado para portales de proveedores y clientes',
      lastReview: '28 Jun 2024',
      enabled: true,
    },
    {
      name: 'Bitácora detallada por módulo',
      description: 'Registro extendido de cambios e interacciones',
      lastReview: '22 Jun 2024',
      enabled: true,
    },
    {
      name: 'Modo mantenimiento nocturno',
      description: 'Bloquea despliegues entre 00:00 y 04:00',
      lastReview: '17 Jun 2024',
      enabled: false,
    },
  ]);

  readonly tasks = signal<TaskItem[]>([
    {
      title: 'Actualizar matriz RACI por módulo',
      owner: 'Equipo QA',
      deadline: '08 Jul 2024',
      progress: 65,
    },
    {
      title: 'Configurar umbrales de alerta de inventario',
      owner: 'Gestor de Operaciones',
      deadline: '10 Jul 2024',
      progress: 40,
    },
    {
      title: 'Validar accesos a reportes financieros',
      owner: 'Seguridad TI',
      deadline: '12 Jul 2024',
      progress: 85,
    },
  ]);

  formatVariation(value: number) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${Math.abs(value)}%`;
  }

  statusLabel(status: RoleRow['status']) {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'revision':
        return 'En revisión';
      case 'suspendido':
        return 'Suspendido';
    }
  }

  severityLabel(severity: AuditEntry['severity']) {
    switch (severity) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
    }
  }
}
