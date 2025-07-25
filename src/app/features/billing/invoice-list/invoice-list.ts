import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Invoice, InvoiceStatus } from '../models/invoice';
import { BillingService } from '../services/billing';
import { Auth} from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { StudentService } from '../../students/services/student';
import { NotificationService } from '../../../core/services/notification';
import { Student } from '../../students/models/student';
import { UserRole } from '../../../core/models/role';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss'
})
export class InvoiceList implements OnInit {
  private billingService = inject(BillingService);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  invoices = signal<Invoice[]>([]);
  parents = signal<{ [key: string]: User }>({});
  students = signal<{ [key: string]: Student }>({});
  loading = signal(false);

  searchControl = new FormControl('');
  statusFilter = new FormControl('all');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  isParent = computed(() => this.currentUser()?.role === UserRole.PARENT);

  InvoiceStatus = InvoiceStatus;

  statusOptions = [
    { value: 'all', label: 'All Invoices' },
    { value: InvoiceStatus.DRAFT, label: 'Draft' },
    { value: InvoiceStatus.PENDING, label: 'Pending' },
    { value: InvoiceStatus.SENT, label: 'Sent' },
    { value: InvoiceStatus.PARTIAL, label: 'Partially Paid' },
    { value: InvoiceStatus.PAID, label: 'Paid' },
    { value: InvoiceStatus.OVERDUE, label: 'Overdue' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelled' }
  ];

  filteredInvoices = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const statusFilter = this.statusFilter.value || 'all';

    return this.invoices().filter(invoice => {
      const matchesSearch = this.getInvoiceSearchText(invoice).toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    this.loading.set(true);

    const user = this.currentUser();
    if (!user) return;

    const invoicesObservable = user.role === UserRole.PARENT
      ? this.billingService.getInvoicesByParent(user.id)
      : this.billingService.getInvoices();

    invoicesObservable.subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.loadRelatedData(invoices);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load invoices');
        this.loading.set(false);
      }
    });
  }

  private loadRelatedData(invoices: Invoice[]): void {
    const parentIds = [...new Set(invoices.map(i => i.parentId))];
    const studentIds = [...new Set(invoices.map(i => i.studentId))];

    // Load parents
    parentIds.forEach(parentId => {
      this.userService.getUserById(parentId).subscribe(parent => {
        if (parent) {
          this.parents.update(parents => ({ ...parents, [parentId]: parent }));
        }
      });
    });

    // Load students
    studentIds.forEach(studentId => {
      this.studentService.getStudentById(studentId).subscribe(student => {
        if (student) {
          this.students.update(students => ({ ...students, [studentId]: student }));
        }
      });
    });
  }

  private getInvoiceSearchText(invoice: Invoice): string {
    const parent = this.parents()[invoice.parentId];
    const student = this.students()[invoice.studentId];

    return [
      invoice.id,
      parent?.firstName,
      parent?.lastName,
      parent?.email,
      student?.firstName,
      student?.lastName,
      invoice.status,
      invoice.amount.toString()
    ].filter(Boolean).join(' ');
  }

  quickStatusUpdate(invoice: Invoice, newStatus: string): void {
    const user = this.currentUser();
    if (!user) return;

    // Validate that newStatus is a valid InvoiceStatus
    if (!Object.values(InvoiceStatus).includes(newStatus as InvoiceStatus)) {
      this.notificationService.showError('Invalid status selected');
      return;
    }

    // Cast newStatus to InvoiceStatus
    const status = newStatus as InvoiceStatus;

    // Prevent updating to the same status
    if (invoice.status === status) {
      return;
    }

    this.billingService.updateInvoiceStatus(
      invoice.id,
      status,
      user.id,
      `Status updated to ${status}`
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Invoice status updated to ${status}`);
        this.loadInvoices();
      },
      error: () => {
        this.notificationService.showError('Failed to update invoice status');
      }
    });
  }

  markAsPaid(invoice: Invoice): void {
    const user = this.currentUser();
    if (!user) return;

    this.billingService.updateInvoiceStatus(
      invoice.id,
      InvoiceStatus.PAID,
      user.id,
      'Payment confirmed'
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Invoice marked as paid');
        this.loadInvoices();
      },
      error: () => {
        this.notificationService.showError('Failed to mark invoice as paid');
      }
    });
  }

  sendReminder(invoice: Invoice): void {
    this.billingService.sendInvoiceReminder(invoice.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Reminder sent successfully');
      },
      error: () => {
        this.notificationService.showError('Failed to send reminder');
      }
    });
  }

  getStatusBadgeClass(status: InvoiceStatus): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case InvoiceStatus.PAID:
        return `${baseClasses} bg-green-100 text-green-800`;
      case InvoiceStatus.PENDING:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case InvoiceStatus.OVERDUE:
        return `${baseClasses} bg-red-100 text-red-800`;
      case InvoiceStatus.DRAFT:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case InvoiceStatus.CANCELLED:
        return `${baseClasses} bg-red-100 text-red-800`;
      case InvoiceStatus.PARTIAL:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getDaysOverdue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPaidAmount(): number {
    return this.filteredInvoices()
      .filter(invoice => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  }

  getTotalAmount(): number {
    return this.filteredInvoices().reduce((total, invoice) => total + invoice.amount, 0);
  }

  getPendingCount(): number {
    return this.filteredInvoices()
      .filter(invoice => invoice.status === InvoiceStatus.PENDING).length;
  }

  getOverdueCount(): number {
    return this.filteredInvoices()
      .filter(invoice => invoice.status === InvoiceStatus.OVERDUE).length;
  }
  trackByInvoiceId(index: number, invoice: Invoice): string {
    return invoice.id;
  }
}
