import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Utils {
  convertBase64ToPng(image: string) {
    const byteString = atob(image.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    const newBlob = new Blob([ab], {
      type: 'image/png'
    });
    return newBlob;
  }
}
