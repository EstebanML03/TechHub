import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Lightbulb, Heart, Eye, Plus, X, Search, Filter, MapPin, Users, DollarSign, UserPlus, Globe, Mail, Phone, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle } from 'lucide-angular';

import { EmprendimientosRoutingModule } from './emprendimientos-routing-module';
import { Emprendimientos } from './pages/emprendimientos/emprendimientos';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { FiltersComponent } from '../../shared/components/filters/filters';


@NgModule({
  declarations: [
    Emprendimientos
  ],
  imports: [
    CommonModule,
    FormsModule,
    EmprendimientosRoutingModule,
    PaginationComponent,
    FiltersComponent,
    LucideAngularModule.pick({ Lightbulb, Heart, Eye, Plus, X, Search, Filter, MapPin, Users, DollarSign, UserPlus, Globe, Mail, Phone, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle })
  ]
})
export class EmprendimientosModule { }
