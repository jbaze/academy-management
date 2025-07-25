import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  profileForm: FormGroup;
  currentUser: User | null = null;
  isEditing = false;
  isLoading = false;

  constructor() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      avatar: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phone: this.currentUser.phone || '',
        avatar: this.currentUser.avatar || ''
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData(); // Reset form if canceling
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;

      // In a real app, this would make an API call
      setTimeout(() => {
        this.notificationService.showSuccess('Profile updated successfully!');
        this.isEditing = false;
        this.isLoading = false;
      }, 1000);
    }
  }

  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
}
