import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmprendimientosRoutingModule } from './emprendimientos-routing-module';
import { Emprendimientos } from './pages/emprendimientos/emprendimientos';


@NgModule({
  declarations: [
    Emprendimientos
  ],
  imports: [
    CommonModule,
    EmprendimientosRoutingModule
  ]
})
export class EmprendimientosModule { }
