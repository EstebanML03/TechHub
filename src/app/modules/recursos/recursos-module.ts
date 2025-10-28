import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecursosRoutingModule } from './recursos-routing-module';
import { Recursos } from './pages/recursos/recursos';


@NgModule({
  declarations: [
    Recursos
  ],
  imports: [
    CommonModule,
    RecursosRoutingModule
  ]
})
export class RecursosModule { }
