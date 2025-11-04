import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Publicacion, Comentario, Usuario } from '../models/post.model';

/**
 * Este servicio es legacy y ya no se usa.
 * Ahora usamos PublicacionesService, ComentariosService y EtiquetasService
 * que se conectan con la API real.
 * 
 * Se mantiene por compatibilidad pero debería ser removido.
 * 
 * @deprecated Use PublicacionesService instead
 */
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private publicacionesSubject = new BehaviorSubject<Publicacion[]>([]);
  public publicaciones$ = this.publicacionesSubject.asObservable();

  constructor() {
  }

  getPublicaciones(): Observable<Publicacion[]> {
    return this.publicaciones$;
  }

  getPublicacionById(id: number): Publicacion | undefined {
    return this.publicacionesSubject.value.find(p => p.id_publicacion === id);
  }
}
