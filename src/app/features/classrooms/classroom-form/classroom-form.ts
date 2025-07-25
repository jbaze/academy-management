import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Classroom } from '../models/classroom';
import { ClassroomService } from '../services/classroom';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-classroom-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './classroom-form.html',
  styleUrl: './classroom-form.scss'
})
export class ClassroomForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);

  classroomForm: FormGroup;
  classroomId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);

  equipmentOptions = [
    'Whiteboard', 'Projector', 'Computer', 'Audio System', 'Air Conditioning',
    'Laboratory Equipment', 'Art Supplies', 'Musical Instruments', 'Sports Equipment',
    'Interactive Board', 'Document Camera', 'Microscopes', 'Tablets', 'Wi-Fi'
  ];

  constructor() {
    this.classroomForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      equipment: this.formBuilder.array([]),
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.classroomId.set(id);
      this.isEditing.set(true);
      this.loadClassroom(id);
    } else {
      // Add default equipment for new classroom
      this.addEquipment();
    }
  }

  private loadClassroom(id: string): void {
    this.isLoading.set(true);
    this.classroomService.getClassroomById(id).subscribe({
      next: (classroom) => {
        if (classroom) {
          this.populateForm(classroom);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load classroom');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(classroom: Classroom): void {
    this.classroomForm.patchValue({
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location,
      description: classroom.description,
      isActive: classroom.isActive
    });

    // Clear and populate equipment array
    this.clearFormArray('equipment');
    classroom.equipment.forEach(eq => {
      this.equipmentArray.push(this.formBuilder.control(eq, Validators.required));
    });

    // Add empty equipment field if none exist
    if (classroom.equipment.length === 0) {
      this.addEquipment();
    }
  }

  private clearFormArray(arrayName: string): void {
    const array = this.classroomForm.get(arrayName) as FormArray;
    while (array.length !== 0) {
      array.removeAt(0);
    }
  }

  get equipmentArray(): FormArray {
    return this.classroomForm.get('equipment') as FormArray;
  }

  addEquipment(): void {
    this.equipmentArray.push(this.formBuilder.control('', Validators.required));
  }

  removeEquipment(index: number): void {
    this.equipmentArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.classroomForm.valid) {
      this.isLoading.set(true);

      const formValue = this.classroomForm.getRawValue();
      // Filter out empty equipment items
      formValue.equipment = formValue.equipment.filter((eq: string) => eq.trim() !== '');

      const operation = this.isEditing()
        ? this.classroomService.updateClassroom(this.classroomId()!, formValue)
        : this.classroomService.createClassroom(formValue);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Classroom ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/classrooms']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} classroom`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.classroomForm.controls).forEach(key => {
      this.classroomForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/classrooms']);
  }

  // Form getters
  get name() { return this.classroomForm.get('name'); }
  get capacity() { return this.classroomForm.get('capacity'); }
  get location() { return this.classroomForm.get('location'); }
  get description() { return this.classroomForm.get('description'); }
}
