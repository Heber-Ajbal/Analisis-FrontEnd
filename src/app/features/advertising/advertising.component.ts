import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Campaign {
  id: string;
  name: string;
  channel: 'social' | 'search' | 'email' | 'display';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

const STATUS_LABEL: Record<Campaign['status'], string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  running: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
};

const STATUS_CLASS: Record<Campaign['status'], string> = {
  draft: 'chip-muted',
  scheduled: 'chip-info',
  running: 'chip-success',
  paused: 'chip-warning',
  completed: 'chip-neutral',
};

const CHANNEL_ICON: Record<Campaign['channel'], string> = {
  social: 'groups',
  search: 'travel_explore',
  email: 'mail',
  display: 'monitor',
};

@Component({
  selector: 'app-advertising',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
  ],
  templateUrl: './advertising.component.html',
  styleUrls: ['./advertising.component.scss'],
})
export class AdvertisingComponent {
  private campaigns = signal<Campaign[]>([
    {
      id: 'cmp-001',
      name: 'Lanzamiento colección verano',
      channel: 'social',
      status: 'running',
      budget: 45000,
      spent: 27500,
      impressions: 890000,
      clicks: 74000,
      conversions: 3200,
      startDate: '2024-05-01',
    },
    {
      id: 'cmp-002',
      name: 'Remarketing carrito abandonado',
      channel: 'email',
      status: 'scheduled',
      budget: 12000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      startDate: '2024-07-05',
    },
    {
      id: 'cmp-003',
      name: 'Promoción SEO marketplace',
      channel: 'search',
      status: 'completed',
      budget: 18000,
      spent: 17450,
      impressions: 410000,
      clicks: 19000,
      conversions: 980,
      startDate: '2024-03-10',
      endDate: '2024-04-25',
    },
    {
      id: 'cmp-004',
      name: 'Campaña display regional',
      channel: 'display',
      status: 'paused',
      budget: 22000,
      spent: 7800,
      impressions: 150000,
      clicks: 5800,
      conversions: 220,
      startDate: '2024-06-01',
    },
  ]);

  readonly stats = computed(() => {
    const rows = this.campaigns();
    const active = rows.filter((campaign) => campaign.status === 'running');
    const scheduled = rows.filter((campaign) => campaign.status === 'scheduled');
    const spent = rows.reduce((acc, campaign) => acc + campaign.spent, 0);
    const budget = rows.reduce((acc, campaign) => acc + campaign.budget, 0);
    const impressions = rows.reduce((acc, campaign) => acc + campaign.impressions, 0);
    const clicks = rows.reduce((acc, campaign) => acc + campaign.clicks, 0);
    const conversions = rows.reduce((acc, campaign) => acc + campaign.conversions, 0);

    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const cvr = clicks ? (conversions / clicks) * 100 : 0;
    const spendRatio = budget ? (spent / budget) * 100 : 0;

    return {
      totalCampaigns: rows.length,
      active: active.length,
      scheduled: scheduled.length,
      spent,
      budget,
      spendRatio,
      impressions,
      clicks,
      ctr,
      conversions,
      cvr,
    };
  });

  readonly runningCampaigns = computed(() =>
    this.campaigns().filter((campaign) => campaign.status === 'running')
  );

  readonly otherCampaigns = computed(() =>
    this.campaigns().filter((campaign) => campaign.status !== 'running')
  );

  channelIcon(channel: Campaign['channel']) {
    return CHANNEL_ICON[channel];
  }

  statusLabel(status: Campaign['status']) {
    return STATUS_LABEL[status];
  }

  statusClass(status: Campaign['status']) {
    return STATUS_CLASS[status];
  }
}
