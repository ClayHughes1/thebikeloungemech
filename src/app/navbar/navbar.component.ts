import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-services';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, HttpClientModule  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isLoggedIn = false;

  constructor(private authService: AuthService,private http: HttpClient,private router: Router) {
    this.authService.isLoggedIn.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  logout(): void {
    // this.http.post('http://localhost:3000/logout', {}).subscribe(
    //   (response) => {
        // Clear any stored user information (e.g., token)
        localStorage.removeItem('userToken');
        this.isLoggedIn = false;
        this.router.navigate(['/home']); // Redirect to the home page
    //   },
    //   (error) => {
    //     console.error('Error logging out:', error);
    //   }
    // );
  }

}
