import { Directive, ElementRef, HostListener, input, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]', // Se usa como atributo: <p appHighlight>
  standalone: true
})
export class HighlightDirective {
  // Usamos la nueva API de inputs (Signals)
  highlightColor = input<string>('yellow');
  
  private el = inject(ElementRef);

  // Escuchamos eventos del host (el elemento que tiene la directiva)
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor());
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(null);
  }

  private highlight(color: string | null) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}