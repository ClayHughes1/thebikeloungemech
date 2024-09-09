import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

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

  // updateBike(imageID: string) {
  //   const bike = this.bikes.find(b => b.ImageID === imageID);
  //   if (bike) {
  //     this.http.post('http://localhost:3000/updatemybike', bike).subscribe(
  //       (response) => {
  //         console.log('Bike updated successfully:', response);
  //         // Refresh the bikes page
  //         this.loadBikes();
  //       },
  //       (error) => {
  //         console.error('Error updating bike:', error);
  //       }
  //     );
  //   }
  // }

  saveBike(bike: any) {
    console.log('EMAIKL.............  ',bike.userEmail,'\n');
    console.log(bike.ImageID,'\n');


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

  // addBike(bike: any): void {
  //   this.router.navigate(['/add-bike']);


  //   // this.http.post('http://localhost:3000/addBike', bike, { withCredentials: true })
  //   //   .subscribe(
  //   //     (response) => {
  //   //       console.log('Bike added:', response);
  //   //       this.loadBikes(); // Reload bikes after adding
  //   //     },
  //   //     (error) => {
  //   //       console.error('Error adding bike:', error);
  //   //     }
  //   //   );
  // }


  // onBuyBike(bike: any): void {
  //   // Implement your purchase logic here
  //   console.log(`Buying bike: ${bike.make} ${bike.model}`);
  // }
}
