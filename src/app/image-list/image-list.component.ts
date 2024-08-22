import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Image } from '../model/image.model'; // Adjust the path as necessary
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit {

  @Input() images: Image[] = [];

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadBikeImages();
  }

  loadBikeImages(): void {
    this.http.get<Image[]>('http://localhost:3000/getBikeImages')
      .subscribe(
        (response: Image[]) => {
          this.images = response.map(bike => new Image(
            bike.userEmail,
            bike.userId, // Assuming 'id' is UUID
            bike.Id, // Update to lowercase 'i'
            bike.src,
            bike.href,
            bike.description,
            bike.year,
            bike.make,
            bike.model,
            bike.price,
            bike.isForSale,
            bike.isSold
          ));
          console.log('Bike images loaded:', this.images);
        },
        (error) => {
          console.error('Error loading bike images:', error);
        }
      );
  }

  navigateToDetail(event: Event, image: Image): void {
    console.log('in click event');
    event.preventDefault();  // Prevent the default anchor click behavior
    this.router.navigate(['/bike-detail/'], {
      queryParams: {
        src: image.src,
        href: image.href,
        description: image.description,
        year: image.year,
        make: image.make,
        model: image.model,
        price: image.price,
        isForSale: image.isForSale,
        IsSold: image.isSold
      }
    });
  }
}
