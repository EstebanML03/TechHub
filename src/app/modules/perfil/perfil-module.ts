import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Mail, MapPin, Briefcase, Globe, Github, Linkedin, Edit2, Check, X, Camera, Code, Heart, Calendar, FileText, Users, Lightbulb, MessageCircle, Activity } from 'lucide-angular';
import { PerfilRoutingModule } from './perfil-routing-module';
import { Perfil } from './pages/perfil/perfil';

@NgModule({
  declarations: [
    Perfil
  ],
  imports: [
    CommonModule,
    FormsModule,
    PerfilRoutingModule,
    LucideAngularModule.pick({
      User, Mail, MapPin, Briefcase, Globe, Github, Linkedin,
      Edit2, Check, X, Camera, Code, Heart,
      Calendar, FileText, Users, Lightbulb, MessageCircle, Activity
    })
  ]
})
export class PerfilModule { }
