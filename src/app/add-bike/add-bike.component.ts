import { Component } from '@angular/core';
import { Image } from '../model/image.model'; // Adjust the path as necessary
import { HeaderComponent } from '../header/header.component';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-bike',
  standalone: true,
  imports: [HeaderComponent,CommonModule,HttpClientModule,ReactiveFormsModule,FormsModule],
  templateUrl: './add-bike.component.html',
  styleUrl: './add-bike.component.css'
})
export class AddBikeComponent {
  // bikes: Image[] = [];
  newBike: Image = new Image('','', 0, '', '', '', 0, '', '', '', false, false);
  fileError: string | null = null;
  isUploading = false;


  // bike!: Image;
//bike image 2
  constructor(private http: HttpClient) {}

  onSubmit() {
    console.log('Submitting hte add bike form................\n');
    try {
      // this.bikes.push(this.newBike);
      console.log('NEW BIKE....  \n',this.newBike);
        // Post the new bike details to the backend
        this.http.post('http://localhost:3000/addbike', this.newBike, { withCredentials: true })
          .subscribe(
            (response) => {
              console.log('Bike details submitted successfully:', response);
            },
            (error) => {
              console.error('Error submitting bike details:', error);
            }
          );
    
        // Reset the newBike with default values for the next form submission
        // this.newBike = new Image('', 0, '', '', '', 0, '', '', '', false, false);
    
    } catch (error) {
      console.log('an error has occurred ..........  ',error);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

      if (!validTypes.includes(file.type)) {
        this.fileError = 'Invalid file type. Please upload a .jpg, .png, or .gif file.';
        return;
      }

      this.fileError = null;
    }
  }


}
