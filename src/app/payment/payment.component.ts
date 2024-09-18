import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PaymentDetail } from '../model/paymentdetail.model';
import { FooterComponent } from '../footer/footer.component';
import { GeolocationService } from '../services/geolocation.service';
import { error } from 'node:console';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

@Component({
  selector: 'app-payment',
  standalone:true,
  imports: [HeaderComponent,CommonModule,FormsModule,FooterComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  public salestax: number = 0.07;
  public taxtotal: number = 0;
  public latitude: number | null = 0;
  public longitude: number | null = 0;
  public zipCode: string | null = '';
  public errorMessage: string | null = '';
  public purtotal: number = 0;

  make: string | null = '';
  model: string | null = '';
  price: number | null = null;
  id: string | null = '';

  paymentinfo = {
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
  };

  payment!: PaymentDetail;

  constructor(private route: ActivatedRoute, private http: HttpClient, private geolocationService: GeolocationService) {}

  ngOnInit(): void {
    this.payment = new PaymentDetail(0, '', '', '', '');

    // Get the bike details from the query parameters
    this.make = this.route.snapshot.queryParamMap.get('make');
    this.model = this.route.snapshot.queryParamMap.get('model');
    this.price = Number(this.route.snapshot.queryParamMap.get('price'));
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.taxtotal = this.price * this.salestax;
    this.purtotal = this.price + this.taxtotal;

    // this.getSalesTax();
    this.getLocationAndZipCode();
  }

  getLocationAndZipCode(): void {
    // Check if we are in the browser
    if (typeof window !== 'undefined' && 'navigator' in window) {
      console.log('GETTING ZIP CODE..........  \n');
      
      if (!navigator.geolocation) {
        this.errorMessage = 'Geolocation is not supported by this browser.';
        console.error(this.errorMessage);
        return;
      }
  
      this.geolocationService.getUserLocation()
        .then((location) => {
          console.log('LOCATION ............... \n', location);
          this.latitude = location.latitude;
          this.longitude = location.longitude;
          console.log('Latitude:', this.latitude, 'Longitude:', this.longitude);
          
          this.geolocationService.getZipCode(this.latitude, this.longitude)
            .subscribe(
              (response) => {
                console.log('RESPONSE..........  \n', response);
                if (response && response.results && response.results.length > 0) {
                  const addressComponents = response.results[0].address_components;
                  const postalCodeComponent = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('postal_code')
                  );
                  if (postalCodeComponent) {
                    this.zipCode = postalCodeComponent.long_name;
                    console.log('ZIP Code:', this.zipCode);
                  } else {
                    this.errorMessage = 'No ZIP code found for this location.';
                    console.log('ERROR GETTING THE GEO LOCATION');
                    console.error(this.errorMessage);
                  }
                }
              },
              (error) => {
                this.errorMessage = 'Error fetching ZIP code: ' + error;
                console.error(this.errorMessage);
              }
            );
        })
        .catch((error) => {
          if (error.code === error.PERMISSION_DENIED) {
            this.errorMessage = 'User denied the request for Geolocation.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            this.errorMessage = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            this.errorMessage = 'The request to get user location timed out.';
          } else if (error.code === error.UNKNOWN_ERROR) {
            this.errorMessage = 'An unknown error occurred.';
          } else {
            this.errorMessage = 'Error fetching location: ' + error.message;
          }
          console.error(this.errorMessage);
        });
    } else {
      this.errorMessage = 'Geolocation is not available in this environment.';
      console.error(this.errorMessage);
    }
  }
  
  onSubmitPayment(): void {
    console.log(`Submitting payment for bike: ${this.make} ${this.model}, Price: ${this.price}, ID: ${this.id}`);
    // Handle the payment submission logic here
  }
}
