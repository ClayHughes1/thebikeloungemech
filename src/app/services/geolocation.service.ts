
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Import environment file


@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private geocodingApiUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json';
  private apiKey: string = environment.googleApiKey; // Replace with your Google API key

  constructor(private http: HttpClient) {}

  // Get the user's current location
  getUserLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            let errorMessage = '';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'User denied the request for Geolocation.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'The request to get user location timed out.';
                break;
              default:
                errorMessage = 'An unknown error occurred.';
                break;
            }
            reject(errorMessage);
          }
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  // Call Google Geocoding API to get ZIP code
  getZipCode(lat: number, lon: number): Observable<any> {
    const url = `${this.geocodingApiUrl}?latlng=${lat},${lon}&key=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        return throwError('Error fetching ZIP code: ' + error.message);
      })
    );
  }
}





// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class GeolocationService {

//   constructor() { }
// }
