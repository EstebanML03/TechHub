import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { LucideAngularModule, Settings, Bell, Lock, Palette, User, Shield, Eye, EyeOff, Check, X, ChevronRight, Info, ArrowLeft, Moon, Volume2, ArrowRight, Mail, MessageCircle, MessageSquare, Users, FileText, Lightbulb, Calendar, Minus, Circle, CheckCircle, RotateCcw, Save, Globe, Phone, MapPin, Activity, Folder, Search, BarChart, Download, Trash2, AlertTriangle, Key, AlertCircle, Sparkles, ShieldCheck, Sun, Monitor, Layout, Droplet, Zap, UserCheck, UserX, ChevronsLeft, ChevronsRight, ChevronLeft, GraduationCap, CreditCard, Edit2, Camera, Hammer, Wrench, BookOpen, ExternalLink, Printer, FileCheck, Briefcase, UserCircle, Copyright, Scale, XCircle, Edit, ChevronUp, ChevronDown } from 'lucide-angular';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    LucideAngularModule.pick({
      Settings, Bell, Lock, Palette, User, Shield, Eye, EyeOff, Check, X,
      ChevronRight, Info, ArrowLeft, Moon, Volume2, ArrowRight, Mail,
      MessageCircle, MessageSquare, Users, FileText, Lightbulb, Calendar,
      Minus, Circle, CheckCircle, RotateCcw, Save, Globe, Phone, MapPin,
      Activity, Folder, Search, BarChart, Download, Trash2, AlertTriangle,
      Key, AlertCircle, Sparkles, ShieldCheck, Sun, Monitor,
      Layout, Droplet, Zap, UserCheck, UserX, ChevronsLeft, ChevronsRight, ChevronLeft,
      GraduationCap, CreditCard, Edit2, Camera, Hammer, Wrench, BookOpen, ExternalLink,
      Printer, FileCheck, Briefcase, UserCircle, Copyright, Scale, XCircle, Edit,
      ChevronUp, ChevronDown
    })
  ]
})
export class SettingsModule { }
