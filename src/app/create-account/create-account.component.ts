import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [HeaderComponent,ReactiveFormsModule, HttpClientModule,CommonModule ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.css'
})
export class CreateAccountComponent {
  createAccountForm: FormGroup;
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private fb: FormBuilder,private http: HttpClient,private router: Router) {
    this.createAccountForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.controls['password'].value === form.controls['confirmPassword'].value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const accountData = this.createAccountForm.value;

    //this.createAccountForm.value
    if (this.createAccountForm.valid) {
      this.http.post('http://localhost:3000/submit', accountData)
        .subscribe({
          next: (response) => {
            this.errorMessage = '';
            console.log('Data submitted successfully');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            if (error.status === 400 && error.error.message === 'An account already exists with this email.') {
              console.error('Error submitting data', error);
              this.errorMessage = 'An account already exists with this email.';
            } else {
              console.error('Error submitting data', error);
              this.errorMessage = 'An error occurred. Please try again later.';
            }
          },
          complete: () => {
            console.log('Request completed');
          }
      });
    }
  }
}
