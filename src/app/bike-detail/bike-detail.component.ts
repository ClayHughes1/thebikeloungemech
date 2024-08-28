import { Component,OnInit  } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MotorcycleViewerComponent } from '../motorcycle-viewer/motorcycle-viewer.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-bike-detail',
  standalone: true,
  imports: [HeaderComponent,CommonModule,MotorcycleViewerComponent,FooterComponent],
  templateUrl: './bike-detail.component.html',
  styleUrl: './bike-detail.component.css'
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


  constructor(private route: ActivatedRoute,private router: Router) {
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

    console.log(this.isForSale );
  }

  // ngOnInit(): void {
  //   this.userID = this.getCookie('userID');
  // }

  // getCookie(name: string): string | null {
  //   const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  //   return match ? decodeURIComponent(match[2]) : null;
  // }


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
}
