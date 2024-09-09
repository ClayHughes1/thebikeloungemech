import { Component, AfterViewInit, Inject, PLATFORM_ID, NgZone,Input  } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as PANOLENS from 'panolens';

@Component({
  selector: 'app-motorcycle-viewer',
  templateUrl: './motorcycle-viewer.component.html',
  styleUrls: ['./motorcycle-viewer.component.css'],
  standalone:true
})
export class MotorcycleViewerComponent implements AfterViewInit  {
  @Input() src: string | undefined;


  //This code block works to display the image but 
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('BROWSER ID............     ',this.platformId);
      try {
        if (typeof process === 'undefined') {
          (window as any).process = {
              env: {}
          };
        }

        if (this.src) {
          const panorama = new PANOLENS.ImagePanorama(this.src);

          const viewer = new PANOLENS.Viewer({
            container: document.querySelector('#panorama'),
          });

          viewer.add(panorama);
        } else {
          console.error('No image source provided for the panorama.');
        }

        // const panorama = new PANOLENS.ImagePanorama('../assets/images/360_motorcycle.webp');

        // const viewer = new PANOLENS.Viewer({
        //   container: document.querySelector('#panorama'),
        // });
        
        // viewer.add(panorama);

      } catch (error) {
        console.error('Error creating panorama or viewer:', error);
      }
    }
  }
}
