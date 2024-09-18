import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { CurrencyPipe } from '@angular/common';

import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-bikes',
  standalone: true,
  imports: [CommonModule,HeaderComponent,HttpClientModule, FormsModule,FooterComponent],
  templateUrl: './user-bikes.component.html',
  styleUrl: './user-bikes.component.css'
})

export class UserBikesComponent {
  bikes: any[] = [];

  constructor(private http: HttpClient,private router: Router) {}
  
  ngOnInit(): void {
    this.loadBikes();
  }

  loadBikes(): void {
    this.http.get('http://localhost:3000/getBikeDetails', { withCredentials: true })
      .subscribe(
        (response: any) => {
          console.log('RESPONSE FOMR SERVER \n',response);
          this.bikes = response;
        },
        (error) => {
          console.error('Error when loading bike details:', error);
        }
      );
  }

  deleteBike(imageID: string): void {
    this.http.post('http://localhost:3000/deleteBike', { ImageID: imageID }, { withCredentials: true })
      .subscribe(
        (response) => {
          console.log('Bike deleted:', response);
          this.loadBikes(); // Reload bikes after deletion
        },
        (error) => {
          console.error('Error deleting bike:', error);
        }
      );
  }

  saveBike(bike: any) {
    this.http.post('http://localhost:3000/updatemybike', bike).subscribe(
      (response) => {
        console.log('Bike updated successfully:', response);
        bike.isEditing = false;
        this.loadBikes(); // Refresh the bikes page
      },
      (error) => {
        console.error('Error updating bike:', error);
      }
    );
  }

  toggleEdit(bike: any) {
    bike.isEditing = true;
  }

  cancelEdit(bike: any) {
    bike.isEditing = false;
  }
}
