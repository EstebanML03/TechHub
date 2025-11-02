import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, Heart, MessageCircle, Eye, Plus, X, Search, Send, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle, Filter } from 'lucide-angular';

import { BlogRoutingModule } from './blog-routing-module';
import { Blog } from './pages/blog/blog';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { FiltersComponent } from '../../shared/components/filters/filters';


@NgModule({
  declarations: [
    Blog
  ],
  imports: [
    CommonModule,
    FormsModule,
    BlogRoutingModule,
    PaginationComponent,
    FiltersComponent,
    LucideAngularModule.pick({ FileText, Heart, MessageCircle, Eye, Plus, X, Search, Send, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown, Tag, XCircle, Filter })
  ]
})
export class BlogModule { }
