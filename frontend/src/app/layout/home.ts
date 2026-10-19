import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  protected readonly sesion = inject(AuthService).sesion;
}
