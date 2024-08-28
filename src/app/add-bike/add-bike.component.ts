import { Component } from '@angular/core';
import { Image } from '../model/image.model'; // Adjust the path as necessary
import { HeaderComponent } from '../header/header.component';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-add-bike',
  standalone: true,
  imports: [HeaderComponent,CommonModule,HttpClientModule,ReactiveFormsModule,FormsModule,FooterComponent],
  templateUrl: './add-bike.component.html',
  styleUrl: './add-bike.component.css'
})

export class AddBikeComponent {
  isLoggedIn = true;

  newBike = {
    src: '',
    href: '',
    description: '',
    year: 0,
    make: '',
    model: '',
    price:'',
    isForSale: false,
    isSold: false
  };

  selectedFile: File | null = null;
  fileError: string | null = null;

  constructor(private http: HttpClient) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = null;
    } else {
      this.fileError = 'Please select an image file.';
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.fileError = 'Image file is required.';
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    // formData.append('href', this.newBike.href);
    formData.append('description', this.newBike.description);
    formData.append('year', this.newBike.year.toString());
    formData.append('make', this.newBike.make);
    formData.append('model', this.newBike.model);
    formData.append('isForSale', this.newBike.isForSale.toString());
    formData.append('isSold', this.newBike.isSold.toString());

    if (this.newBike.isForSale) {
      formData.append('price', this.newBike.price.toString());
    }

formData.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

    this.http.post('http://localhost:3000/addbike', formData,{ withCredentials: true } ).subscribe(
      response => {
        console.log('Bike added successfully', response);
      },
      error => {
        console.error('Error adding bike', error);
      }
    );
  }
}
