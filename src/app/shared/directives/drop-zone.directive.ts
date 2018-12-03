import { Directive, EventEmitter, HostListener, Output, Input, ElementRef, Renderer } from '@angular/core';
interface FilesDroppedError {
  fileName: string;
  size: number;
  type: string;
}

@Directive({
  selector: '[pjDropZone]'
})
export class DropZoneDirective {
  @Output() filesDropped = new EventEmitter<FileList>();
  @Output() sizeErrorList = new EventEmitter<FilesDroppedError[]>();
  @Output() typeErrorList = new EventEmitter<FilesDroppedError[]>();
  @Output() filesHovered = new EventEmitter<boolean>();
  @Input()
  private sizeLimit: number = null;

  @Input()
  private allowedTypes: string[] = null;

  constructor(private el: ElementRef, private renderer: Renderer) {}

  @HostListener('drop', ['$event'])
  onDrop($event: any) {
    $event.preventDefault();
    const sizeErrorList: FilesDroppedError[] = [];
    const typeErrorList: FilesDroppedError[] = [];
    for (let idx = 0; idx < $event.dataTransfer.files; idx++) {
      if (this.sizeLimit && $event.dataTransfer.files[idx].size > this.sizeLimit) {
        sizeErrorList.push({
          fileName: $event.dataTransfer.files[idx].name,
          size: $event.dataTransfer.files[idx].size,
          type: $event.dataTransfer.files[idx].type
        });
      }
      if (this.allowedTypes && this.allowedTypes.indexOf($event.dataTransfer.files[idx].type) < 0) {
        typeErrorList.push({
          fileName: $event.dataTransfer.files[idx].name,
          size: $event.dataTransfer.files[idx].size,
          type: $event.dataTransfer.files[idx].type
        });
      }
    }

    this.renderer.setElementClass(this.el.nativeElement, 'drop-zone-hover', false);
    this.typeErrorList.emit(typeErrorList);
    this.sizeErrorList.emit(sizeErrorList);
    this.filesDropped.emit($event.dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event: any) {
    $event.preventDefault();
    this.renderer.setElementClass(this.el.nativeElement, 'drop-zone-hover', true);
    this.filesHovered.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event: any) {
    $event.preventDefault();
    this.renderer.setElementClass(this.el.nativeElement, 'drop-zone-hover', false);
    this.filesHovered.emit(false);
  }
}
