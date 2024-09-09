import { Component,OnInit ,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MotorcycleViewerComponent } from '../motorcycle-viewer/motorcycle-viewer.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-bike-detail',
  standalone: true,
  imports: [HeaderComponent,CommonModule,MotorcycleViewerComponent,FooterComponent],
  templateUrl: './bike-detail.component.html',
  styleUrl: './bike-detail.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})

export class BikeDetailComponent {
  // userId: string;
  Id: string;
  src: string;
  href: string;
  description: string;
  year: number;
  make: string;
  model: string;
  price: string;
  isForSale: string;
  isSold: string;
  userID: string | null = '';
  showViewer: boolean = false;
  webpSrc: string | null = null;

  imageList: string[] = [];



  constructor(private route: ActivatedRoute,private router: Router,private http: HttpClient) {
    // this.userId = this.route.snapshot.queryParamMap.get('userId') || '0';
    this.Id = this.route.snapshot.queryParamMap.get('Id') || '0';
    this.src = this.route.snapshot.queryParamMap.get('src') || '';
    this.href = this.route.snapshot.queryParamMap.get('href') || '';
    this.description = this.route.snapshot.queryParamMap.get('description') || '';
    this.year = +this.route.snapshot.queryParamMap.get('year')!;
    this.make = this.route.snapshot.queryParamMap.get('make') || '';
    this.model = this.route.snapshot.queryParamMap.get('model') || '';
    this.price = this.route.snapshot.queryParamMap.get('price') || '';
    this.isForSale = this.route.snapshot.queryParamMap.get('isForSale') == 'false'?'false': 'true';
    this.isSold = this.route.snapshot.queryParamMap.get('isSold') || 'false';
    this.imageList = [
      "http://localhost:4200/assets/uploads/clayhughes11131724855154909_871154500.jpg",
      "http://localhost:4200/assets/uploads/clayhughes11131724855154909_871154500.jpg",
      "http://localhost:4200/assets/uploads/clayhughes11131724855154909_871154500.jpg"
    ]
    
    // const imageListString = this.route.snapshot.queryParamMap.get('imageList');
    // this.imageList = imageListString ? imageListString.split(',') : [];

    // const imageListString = this.route.snapshot.queryParamMap.get('imageList');
    // this.imageList = imageListString ? JSON.parse(imageListString) : [];  // Deserialize the JSON string back into an array

    // this.imageList = imageListString ? JSON.parse(imageListString) : [];
    // this.imageList = imageListString ?  null : [];
      //  this.imageList = imageListString ? JSON.stringify(imageListString) : [];  
    console.log('bike detail image list \n',this.imageList);

    console.log('bike detail image list string \n',this.route.snapshot.queryParamMap.get('imageList'));

  }

  onBuyBike(bike: any): void {

    // if (this.userID) {
      console.log('Buying bike for userID:', this.userID);
      console.log(`Buying bike: ${bike.make} ${bike.model}`);

      this.router.navigate(['/payment'], {
        queryParams: {
          make: bike.make,
          model: bike.model,
          price: bike.price,
          id: bike.id
        }
      });
    // } else {
    //   console.log('No userID found');
    // }

    // Implement your purchase logic here
  }

  convertImageToWebP(src: string, event: Event): void {
    // Prevent the default anchor tag behavior
    event.preventDefault();
  
    const apiUrl = 'http://localhost:3000/convert-to-webp';
    // Proceed with the image conversion logic
    this.http.post<{ webpSrc: string }>(apiUrl, { imageSrc: src })
      .subscribe({
        next: (response) => {
          console.log('RESPONSE FOLLOWING FILE FORMAT \n',response);
          this.webpSrc = response.webpSrc;
          // console.log('web source \n',response.webpSrc);
          this.showViewer = true;
        },
        error: (error) => {
          console.error('Error converting image to WebP:', error);
        }
    });
  }

  toggleViewer(event:Event) {
    event.preventDefault(); 
    this.showViewer = !this.showViewer;
  }
}
