import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { BikeDetailComponent } from './bike-detail/bike-detail.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LoginComponent } from './login/login.component';
import { UserBikesComponent } from './user-bikes/user-bikes.component';
import { PaymentComponent } from './payment/payment.component';
import { AddBikeComponent } from './add-bike/add-bike.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'bike-detail', component: BikeDetailComponent },
    { path: 'create-account', component: CreateAccountComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user-bikes', component: UserBikesComponent },
    { path: 'payment', component: PaymentComponent },
    { path: 'add-bike', component: AddBikeComponent },

];
