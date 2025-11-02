import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, MapPin, Clock, User, Users, Heart, Eye, Plus, X, Search, Filter, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle } from 'lucide-angular';

import { EventosRoutingModule } from './eventos-routing-module';
import { Eventos } from './pages/eventos/eventos';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { FiltersComponent } from '../../shared/components/filters/filters';


@NgModule({
  declarations: [
    Eventos
  ],
  imports: [
    CommonModule,
    FormsModule,
    EventosRoutingModule,
    PaginationComponent,
    FiltersComponent,
    LucideAngularModule.pick({ Calendar, MapPin, Clock, User, Users, Heart, Eye, Plus, X, Search, Filter, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle })
  ]
})
export class EventosModule { }
