import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventosRoutingModule } from './eventos-routing-module';
import { Eventos } from './pages/eventos/eventos';


@NgModule({
  declarations: [
    Eventos
  ],
  imports: [
    CommonModule,
    EventosRoutingModule
  ]
})
export class EventosModule { }
