import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';
import { DropZoneDirective } from '@app/shared/directives/drop-zone.directive';
import { NameLogoComponent } from '@app/shared/components/name-logo.component';

@NgModule({
  imports: [FlexLayoutModule, MaterialModule, CommonModule],
  declarations: [LoaderComponent, DropZoneDirective, NameLogoComponent],
  exports: [LoaderComponent, DropZoneDirective, NameLogoComponent]
})
export class SharedModule {}
