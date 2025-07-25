import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Loading} from '../../../core/services/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private loadingService = inject(Loading);

  loginForm: FormGroup;
  returnUrl: string = '/dashboard';
  showPassword = false;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loadingService.setLoading(true);

      this.authService.login(this.loginForm.value).subscribe({
        next: (success) => {
          if (success) {
            this.notificationService.showSuccess('Login successful!');
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          this.notificationService.showError(error.message || 'Login failed. Please try again.');
          this.loadingService.setLoading(false);
        },
        complete: () => {
          this.loadingService.setLoading(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
