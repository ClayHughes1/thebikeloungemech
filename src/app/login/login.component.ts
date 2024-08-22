import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router
import { AuthService } from '../../services/auth-services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule, HttpClientModule ,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userLogin: FormGroup;
  forgotPasswordForm: FormGroup;
  errorMessage = '';
  resetMessage = '';
  showForgotPassword = false;
  hideForgotPasswordLink = false;

  constructor(private fb: FormBuilder,private http: HttpClient,private router: Router,private authService: AuthService) {
    this.userLogin = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }, 
    );

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', Validators.required] 
    });
  }

  onLogin() {
    if (this.userLogin.invalid) {
      this.errorMessage = 'Please fill out the form correctly.';
      return;
    }

    const loginData = this.userLogin.value;

    this.http.post('http://localhost:3000/login', loginData, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if(response.login)
        {
          console.log('LOGGED IN...............');
          this.authService.login();
          this.errorMessage = '';
          this.router.navigate(['/user-bikes']);
        }
      },
      error: (error) => {
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }

  onForgotPassword(event: Event) {
    console.log('forgot password event was triggered');
    this.showForgotPassword = true;
    this.hideForgotPasswordLink = true; // Hide the link
    event.preventDefault();
  }

  onResetPassword() {
    if (this.forgotPasswordForm.invalid) {
      this.resetMessage = 'Please enter a valid email address.';
      return;
    }

    // const emailData = this.forgotPasswordForm.value;
    const formData = this.forgotPasswordForm.value;

    this.http.post('http://localhost:3000/forgot-password', formData).subscribe({
      next: (response: any) => {
        this.resetMessage = 'If the email is registered, you will receive a password reset link.';
        this.showForgotPassword = false;
      },
      error: (error) => {
        this.resetMessage = 'Error processing your request. Please try again later.';
      }
    });
  }

  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
}
