import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, FileText, Users, TrendingUp, Activity, CalendarDays, ArrowRight, Tag, Newspaper, Heart, MessageCircle, Zap, CalendarPlus, PenSquare, Lightbulb, UserPlus, UserCircle, CheckCircle, Circle, Clock, CalendarCheck, UserCheck, BarChart, Minus } from 'lucide-angular';
import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './pages/dashboard/dashboard';
import localeEs from '@angular/common/locales/es';

// Registrar locale español
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    LucideAngularModule.pick({
      Calendar,
      FileText,
      Users,
      TrendingUp,
      Activity,
      CalendarDays,
      ArrowRight,
      Tag,
      Newspaper,
      Heart,
      MessageCircle,
      Zap,
      CalendarPlus,
      PenSquare,
      Lightbulb,
      UserPlus,
      UserCircle,
      CheckCircle,
      Circle,
      Clock,
      CalendarCheck,
      UserCheck,
      BarChart,
      Minus
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class DashboardModule { }
