import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth-services';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent,NavbarComponent,FooterComponent,CommonModule,HttpClientModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  isLoggedIn = false;

  constructor(private authService: AuthService,private http: HttpClient,private router: Router) {
    this.authService.isLoggedIn.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }
}
