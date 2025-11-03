import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { jsPDF } from 'jspdf';

interface SeccionTerminos {
  id: string;
  titulo: string;
  icono: string;
  subsecciones: {
    titulo: string;
    contenido: string[];
  }[];
}

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './terminos.html',
  styleUrl: './terminos.css'
})
export class TerminosComponent implements OnInit {
  fechaActualizacion = '3 de noviembre de 2025';
  seccionActiva: string | null = null;

  secciones: SeccionTerminos[] = [
    {
      id: 'aceptacion',
      titulo: 'Aceptación de los Términos',
      icono: 'file-check',
      subsecciones: [
        {
          titulo: 'Acuerdo Legal',
          contenido: [
            'Al acceder y utilizar TechHub, usted acepta estar legalmente vinculado por estos Términos y Condiciones y todas las leyes y regulaciones aplicables.',
            'Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.',
            'El uso continuado de la plataforma constituye la aceptación de cualquier cambio o modificación a estos términos.'
          ]
        },
        {
          titulo: 'Capacidad Legal',
          contenido: [
            'Debe tener al menos 18 años de edad para utilizar TechHub.',
            'Si es menor de edad, solo puede usar la plataforma bajo la supervisión de un padre o tutor legal.',
            'Al crear una cuenta, confirma que toda la información proporcionada es veraz y precisa.'
          ]
        }
      ]
    },
    {
      id: 'servicios',
      titulo: 'Descripción de Servicios',
      icono: 'briefcase',
      subsecciones: [
        {
          titulo: 'Plataforma TechHub',
          contenido: [
            'TechHub es una plataforma de red social y colaboración para profesionales de tecnología, emprendedores e innovadores.',
            'Proporcionamos herramientas para crear perfiles, compartir contenido, participar en eventos, gestionar emprendimientos y conectar con otros miembros de la comunidad.',
            'Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto del servicio en cualquier momento.'
          ]
        },
        {
          titulo: 'Funcionalidades Principales',
          contenido: [
            'Creación y gestión de perfil profesional',
            'Publicación y compartir contenido en el blog comunitario',
            'Registro y participación en eventos tecnológicos',
            'Gestión de emprendimientos y proyectos',
            'Acceso a recursos educativos y de la comunidad',
            'Sistema de mensajería y networking profesional'
          ]
        }
      ]
    },
    {
      id: 'cuenta',
      titulo: 'Cuenta de Usuario',
      icono: 'user-circle',
      subsecciones: [
        {
          titulo: 'Creación de Cuenta',
          contenido: [
            'Para acceder a ciertas funciones, debe crear una cuenta proporcionando información precisa y completa.',
            'Es responsable de mantener la confidencialidad de sus credenciales de acceso.',
            'Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.',
            'No puede compartir su cuenta con terceros ni transferir su cuenta a otra persona.'
          ]
        },
        {
          titulo: 'Responsabilidad del Usuario',
          contenido: [
            'Usted es el único responsable de todo el contenido publicado desde su cuenta.',
            'Debe actualizar su información de perfil para mantenerla precisa y actualizada.',
            'TechHub se reserva el derecho de suspender o eliminar cuentas que violen estos términos.',
            'No debe crear cuentas falsas, impersonar a otros o utilizar bots automatizados.'
          ]
        }
      ]
    },
    {
      id: 'contenido',
      titulo: 'Contenido del Usuario',
      icono: 'file-text',
      subsecciones: [
        {
          titulo: 'Propiedad del Contenido',
          contenido: [
            'Usted conserva todos los derechos sobre el contenido que publica en TechHub.',
            'Al publicar contenido, nos otorga una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar y distribuir ese contenido en relación con nuestros servicios.',
            'Esta licencia continúa incluso si deja de usar TechHub, a menos que elimine el contenido.',
            'Puede eliminar su contenido en cualquier momento, aunque las copias almacenadas en caché pueden permanecer temporalmente.'
          ]
        },
        {
          titulo: 'Contenido Prohibido',
          contenido: [
            'Está prohibido publicar contenido ilegal, difamatorio, fraudulento, o que infrinja derechos de terceros.',
            'No se permite contenido que promueva violencia, odio, discriminación o acoso.',
            'Está prohibido el spam, el contenido engañoso, malware o enlaces maliciosos.',
            'No se permite contenido pornográfico o sexualmente explícito.',
            'Nos reservamos el derecho de eliminar cualquier contenido que viole estas políticas.'
          ]
        }
      ]
    },
    {
      id: 'privacidad',
      titulo: 'Privacidad y Datos',
      icono: 'shield',
      subsecciones: [
        {
          titulo: 'Recopilación de Datos',
          contenido: [
            'Recopilamos información personal que usted proporciona voluntariamente al crear su cuenta y usar nuestros servicios.',
            'También recopilamos datos de uso, como páginas visitadas, interacciones y tiempo en la plataforma.',
            'Utilizamos cookies y tecnologías similares para mejorar su experiencia.',
            'Para más detalles, consulte nuestra Política de Privacidad completa.'
          ]
        },
        {
          titulo: 'Uso de la Información',
          contenido: [
            'Utilizamos su información para proporcionar, mantener y mejorar nuestros servicios.',
            'Podemos usar su información para comunicaciones relacionadas con el servicio.',
            'Nunca venderemos su información personal a terceros.',
            'Implementamos medidas de seguridad razonables para proteger sus datos.'
          ]
        }
      ]
    },
    {
      id: 'propiedad',
      titulo: 'Propiedad Intelectual',
      icono: 'copyright',
      subsecciones: [
        {
          titulo: 'Derechos de TechHub',
          contenido: [
            'Todo el contenido, diseño, gráficos, código y funcionalidad de TechHub son propiedad de TechHub o sus licenciantes.',
            'Las marcas comerciales, logos y marcas de servicio son propiedad de TechHub.',
            'No puede usar nuestros elementos de marca sin permiso previo por escrito.',
            'El software subyacente y la infraestructura están protegidos por derechos de autor y otras leyes.'
          ]
        },
        {
          titulo: 'Licencia Limitada',
          contenido: [
            'Le otorgamos una licencia limitada, no exclusiva y revocable para acceder y usar TechHub para fines personales y no comerciales.',
            'No puede copiar, modificar, distribuir, vender o arrendar ninguna parte de nuestros servicios.',
            'No puede realizar ingeniería inversa o intentar extraer el código fuente de la plataforma.',
            'Cualquier uso no autorizado puede resultar en la terminación de su acceso.'
          ]
        }
      ]
    },
    {
      id: 'conducta',
      titulo: 'Código de Conducta',
      icono: 'scale',
      subsecciones: [
        {
          titulo: 'Comportamiento Esperado',
          contenido: [
            'Trate a todos los miembros de la comunidad con respeto y profesionalismo.',
            'Mantenga las interacciones constructivas y enfocadas en el crecimiento profesional.',
            'Respete las opiniones diferentes y fomente el debate saludable.',
            'Contribuya positivamente a la comunidad compartiendo conocimientos valiosos.'
          ]
        },
        {
          titulo: 'Comportamiento Prohibido',
          contenido: [
            'Acoso, intimidación o cualquier forma de comportamiento abusivo.',
            'Discriminación basada en raza, género, orientación sexual, religión, discapacidad u otras características protegidas.',
            'Suplantación de identidad o representación falsa de afiliaciones.',
            'Interferencia con el funcionamiento normal de la plataforma.',
            'Uso de la plataforma para actividades ilegales o fraudulentas.'
          ]
        }
      ]
    },
    {
      id: 'responsabilidad',
      titulo: 'Limitación de Responsabilidad',
      icono: 'alert-triangle',
      subsecciones: [
        {
          titulo: 'Renuncia de Garantías',
          contenido: [
            'TechHub se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo.',
            'No garantizamos que el servicio será ininterrumpido, seguro o libre de errores.',
            'No somos responsables del contenido publicado por los usuarios.',
            'No garantizamos la exactitud, integridad o utilidad de ninguna información en la plataforma.'
          ]
        },
        {
          titulo: 'Limitación de Daños',
          contenido: [
            'En ningún caso TechHub será responsable por daños indirectos, incidentales, especiales o consecuentes.',
            'Nuestra responsabilidad total no excederá el monto que usted haya pagado por usar el servicio en los últimos 12 meses.',
            'Algunas jurisdicciones no permiten la exclusión de ciertas garantías, por lo que algunas de las exclusiones anteriores pueden no aplicarse.',
            'Usted acepta que su uso de TechHub es bajo su propio riesgo.'
          ]
        }
      ]
    },
    {
      id: 'terminacion',
      titulo: 'Terminación',
      icono: 'x-circle',
      subsecciones: [
        {
          titulo: 'Terminación por el Usuario',
          contenido: [
            'Puede cerrar su cuenta en cualquier momento desde la configuración de su perfil.',
            'Al cerrar su cuenta, perderá acceso a todo su contenido y datos.',
            'Algunas obligaciones pueden sobrevivir a la terminación de su cuenta.',
            'Puede solicitar la eliminación completa de sus datos contactándonos.'
          ]
        },
        {
          titulo: 'Terminación por TechHub',
          contenido: [
            'Nos reservamos el derecho de suspender o terminar su cuenta si viola estos términos.',
            'Podemos terminar o suspender su acceso inmediatamente, sin previo aviso, por conducta que creemos que viola estos términos o es perjudicial para otros usuarios.',
            'Si su cuenta es terminada por violación de términos, no puede crear una nueva cuenta sin nuestro permiso.',
            'La terminación no afecta ningún derecho u obligación que haya surgido antes de la terminación.'
          ]
        }
      ]
    },
    {
      id: 'modificaciones',
      titulo: 'Modificaciones',
      icono: 'edit',
      subsecciones: [
        {
          titulo: 'Cambios a los Términos',
          contenido: [
            'Nos reservamos el derecho de modificar estos términos en cualquier momento.',
            'Le notificaremos sobre cambios materiales mediante un aviso en la plataforma o por correo electrónico.',
            'Su uso continuado de TechHub después de los cambios constituye su aceptación de los nuevos términos.',
            'Es su responsabilidad revisar periódicamente estos términos.'
          ]
        },
        {
          titulo: 'Cambios al Servicio',
          contenido: [
            'Podemos actualizar, modificar o descontinuar cualquier aspecto de TechHub en cualquier momento.',
            'No somos responsables ante usted o terceros por cualquier modificación, suspensión o discontinuación del servicio.',
            'Intentaremos proporcionar un aviso razonable para cambios importantes que afecten significativamente el servicio.'
          ]
        }
      ]
    },
    {
      id: 'general',
      titulo: 'Disposiciones Generales',
      icono: 'book-open',
      subsecciones: [
        {
          titulo: 'Ley Aplicable',
          contenido: [
            'Estos términos se regirán e interpretarán de acuerdo con las leyes del país donde TechHub opera.',
            'Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de esa jurisdicción.',
            'Si alguna disposición de estos términos es considerada inválida, las disposiciones restantes permanecerán en vigor.'
          ]
        },
        {
          titulo: 'Contacto',
          contenido: [
            'Para preguntas sobre estos términos, puede contactarnos a través de:',
            'Email: legal@techhub.com',
            'Dirección: TechHub Inc., Calle Principal 123, Ciudad, País',
            'Teléfono: +1 (555) 123-4567',
            'Intentaremos responder a todas las consultas dentro de 48 horas hábiles.'
          ]
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar la primera sección por defecto
    this.seccionActiva = this.secciones[0].id;
  }

  toggleSeccion(seccionId: string): void {
    this.seccionActiva = this.seccionActiva === seccionId ? null : seccionId;
  }

  isSeccionActiva(seccionId: string): boolean {
    return this.seccionActiva === seccionId;
  }

  scrollToSection(seccionId: string): void {
    this.seccionActiva = seccionId;
    setTimeout(() => {
      const element = document.getElementById(seccionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  imprimirTerminos(): void {
    window.print();
  }

  descargarPDF(): void {
    console.log('🔄 Iniciando generación de PDF...');
    
    try {
      // Crear una nueva instancia de jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log('✅ Instancia de jsPDF creada');

      // Configuración de página
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredSpace: number): void => {
        if (currentY + requiredSpace > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      };

      // Función para dividir texto largo
      const splitText = (text: string, maxWidth: number, fontSize: number): string[] => {
        doc.setFontSize(fontSize);
        return doc.splitTextToSize(text, maxWidth);
      };

      // Header del documento
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 123, 255);
      doc.text('Términos y Condiciones', margin, currentY);
      currentY += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('TechHub - Plataforma de Innovación y Tecnología', margin, currentY);
      currentY += 6;
      doc.text(`Última actualización: ${this.fechaActualizacion}`, margin, currentY);
      currentY += 15;

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Introducción
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Bienvenido a TechHub', margin, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const intro = 'Estos Términos y Condiciones regulan el uso de nuestra plataforma y servicios. Al acceder o utilizar TechHub, usted acepta cumplir con estos términos.';
      const introLines = splitText(intro, contentWidth, 10);
      introLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin, currentY);
        currentY += 5;
      });
      currentY += 10;

      // Recorrer todas las secciones
      this.secciones.forEach((seccion, index) => {
        // Título de la sección
        checkPageBreak(15);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 123, 255);
        doc.text(`${index + 1}. ${seccion.titulo}`, margin, currentY);
        currentY += 10;

        // Recorrer subsecciones
        seccion.subsecciones.forEach((subseccion) => {
          // Título de subsección
          checkPageBreak(10);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(subseccion.titulo, margin + 5, currentY);
          currentY += 7;

          // Contenido de la subsección
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);

          subseccion.contenido.forEach((item) => {
            checkPageBreak(8);
            // Viñeta
            doc.text('•', margin + 5, currentY);
            
            // Texto del item
            const itemLines = splitText(item, contentWidth - 15, 10);
            itemLines.forEach((line: string, lineIndex: number) => {
              if (lineIndex > 0) {
                checkPageBreak(5);
              }
              doc.text(line, margin + 10, currentY);
              currentY += 5;
            });
            currentY += 2;
          });

          currentY += 5;
        });

        currentY += 5;
      });

      // Footer en todas las páginas
      const totalPages = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        
        // Número de página
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Texto legal
        doc.text(
          '© 2025 TechHub. Todos los derechos reservados.',
          margin,
          pageHeight - 10
        );
        
        // Contacto
        doc.text(
          'legal@techhub.com',
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Guardar el PDF
      const fileName = `TechHub-Terminos-y-Condiciones-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('💾 Guardando PDF como:', fileName);
      doc.save(fileName);
      
      console.log('✅ PDF generado y descargado exitosamente');
      alert('✅ PDF descargado exitosamente');
    } catch (error: any) {
      console.error('❌ Error al generar PDF:', error);
      console.error('❌ Mensaje de error:', error?.message);
      console.error('❌ Stack:', error?.stack);
      alert(`Hubo un error al generar el PDF: ${error?.message || 'Error desconocido'}. Por favor, intenta usar la opción de imprimir.`);
    }
  }

  volver(): void {
    this.router.navigate(['/settings']);
  }
}
