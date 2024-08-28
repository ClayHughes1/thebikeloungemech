import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PaymentDetail } from '../model/paymentdetail.model';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-payment',
  standalone:true,
  imports: [HeaderComponent,CommonModule,FormsModule,FooterComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
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

  // payment: PaymentDetail;
  payment!: PaymentDetail;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.payment = new PaymentDetail(0, '', '', '', '');

    // Get the bike details from the query parameters
    this.make = this.route.snapshot.queryParamMap.get('make');
    this.model = this.route.snapshot.queryParamMap.get('model');
    this.price = Number(this.route.snapshot.queryParamMap.get('price'));
    this.id = this.route.snapshot.queryParamMap.get('id');
  }

  onSubmitPayment(): void {
    console.log(`Submitting payment for bike: ${this.make} ${this.model}, Price: ${this.price}, ID: ${this.id}`);
    // Handle the payment submission logic here
  }
}
