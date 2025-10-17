import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvertisingComponent } from './advertising.component';

const routes: Routes = [
  {
    path: '',
    component: AdvertisingComponent,
  },
];

@NgModule({
  imports: [AdvertisingComponent, RouterModule.forChild(routes)],
})
export class AdvertisingModule {}
