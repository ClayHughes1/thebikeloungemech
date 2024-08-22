declare module 'panolens' {
    export class ImagePanorama {
      constructor(imageSrc: string);
    }
  
    export class Viewer {
      constructor(options: { container: HTMLElement | null });
      add(panorama: ImagePanorama): void;
    }
  }
  