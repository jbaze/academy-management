import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Invoice, InvoiceStatus, InvoiceComment, CommentType, PaymentRecord } from '../models/invoice';
import { BillingService } from '../services/billing';
import { Auth } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { StudentService } from '../../students/services/student';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { Student } from '../../students/models/student';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.scss'
})
export class InvoiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private billingService = inject(BillingService);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  invoice = signal<Invoice | null>(null);
  parent = signal<User | null>(null);
  student = signal<Student | null>(null);
  paymentHistory = signal<PaymentRecord[]>([]);
  loading = signal(false);

  // Comment form
  commentControl = new FormControl('', [Validators.required]);
  commentTypeControl = new FormControl(CommentType.GENERAL);
  addingComment = signal(false);

  // Payment form
  paymentAmountControl = new FormControl(0, [Validators.required, Validators.min(0.01)]);
  paymentMethodControl = new FormControl('', [Validators.required]);
  paymentReferenceControl = new FormControl('');
  paymentNotesControl = new FormControl('');
  recordingPayment = signal(false);

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    const inv = this.invoice();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.PARENT && user.id === inv?.parentId);
  });

  InvoiceStatus = InvoiceStatus;
  CommentType = CommentType;

  statusOptions = [
    { value: InvoiceStatus.DRAFT, label: 'Draft' },
    { value: InvoiceStatus.PENDING, label: 'Pending' },
    { value: InvoiceStatus.SENT, label: 'Sent' },
    { value: InvoiceStatus.PARTIAL, label: 'Partially Paid' },
    { value: InvoiceStatus.PAID, label: 'Paid' },
    { value: InvoiceStatus.OVERDUE, label: 'Overdue' },
    { value: InvoiceStatus.CANCELLED, label: 'Cancelled' }
  ];

  paymentMethods = [
    'Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Online Payment', 'Other'
  ];

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoice(invoiceId);
      this.loadPaymentHistory(invoiceId);
    }
  }

  private loadInvoice(id: string): void {
    this.loading.set(true);

    this.billingService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        if (invoice) {
          this.invoice.set(invoice);
          this.loadParent(invoice.parentId);
          this.loadStudent(invoice.studentId);

          // Set payment amount to remaining balance
          const totalPaid = this.calculateTotalPaid(invoice);
          const remainingBalance = invoice.amount - totalPaid;
          this.paymentAmountControl.setValue(remainingBalance);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load invoice');
        this.loading.set(false);
      }
    });
  }

  private loadParent(parentId: string): void {
    this.userService.getUserById(parentId).subscribe({
      next: (parent) => {
        if (parent) {
          this.parent.set(parent);
        }
      }
    });
  }

  private loadStudent(studentId: string): void {
    this.studentService.getStudentById(studentId).subscribe({
      next: (student) => {
        if (student) {
          this.student.set(student);
        }
      }
    });
  }

  private loadPaymentHistory(invoiceId: string): void {
    this.billingService.getPaymentHistory(invoiceId).subscribe({
      next: (payments) => {
        this.paymentHistory.set(payments);
      }
    });
  }

  updateStatus(newStatus: string): void {
    const invoice = this.invoice();
    const user = this.currentUser();
    if (!invoice || !user) return;

    this.billingService.updateInvoiceStatus(
      invoice.id,
      newStatus as InvoiceStatus,
      user.id,
      `Status changed from ${invoice.status} to ${newStatus}`
    ).subscribe({
      next: (updatedInvoice) => {
        this.invoice.set(updatedInvoice);
        this.notificationService.showSuccess(`Invoice status updated to ${newStatus}`);
      },
      error: () => {
        this.notificationService.showError('Failed to update invoice status');
      }
    });
  }

  addComment(): void {
    if (this.commentControl.invalid) return;

    const invoice = this.invoice();
    const user = this.currentUser();
    if (!invoice || !user) return;

    this.addingComment.set(true);

    this.billingService.addInvoiceComment(
      invoice.id,
      this.commentControl.value!,
      this.commentTypeControl.value as CommentType,
      user.id,
      `${user.firstName} ${user.lastName}`
    ).subscribe({
      next: (updatedInvoice) => {
        this.invoice.set(updatedInvoice);
        this.commentControl.setValue('');
        this.notificationService.showSuccess('Comment added successfully');
        this.addingComment.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to add comment');
        this.addingComment.set(false);
      }
    });
  }

  recordPayment(): void {
    if (this.paymentAmountControl.invalid || this.paymentMethodControl.invalid) return;

    const invoice = this.invoice();
    const user = this.currentUser();
    if (!invoice || !user) return;

    this.recordingPayment.set(true);

    const payment: Omit<PaymentRecord, 'id' | 'createdAt'> = {
      invoiceId: invoice.id,
      amount: this.paymentAmountControl.value!,
      paymentDate: new Date(),
      paymentMethod: this.paymentMethodControl.value!,
      reference: this.paymentReferenceControl.value || undefined,
      notes: this.paymentNotesControl.value || undefined,
      createdBy: user.id
    };

    this.billingService.recordPayment(invoice.id, payment).subscribe({
      next: (updatedInvoice) => {
        this.invoice.set(updatedInvoice);
        this.loadPaymentHistory(invoice.id);
        this.resetPaymentForm();
        this.notificationService.showSuccess('Payment recorded successfully');
        this.recordingPayment.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to record payment');
        this.recordingPayment.set(false);
      }
    });
  }

  private resetPaymentForm(): void {
    this.paymentAmountControl.setValue(0);
    this.paymentMethodControl.setValue('');
    this.paymentReferenceControl.setValue('');
    this.paymentNotesControl.setValue('');
  }

  calculateTotalPaid(invoice: Invoice): number {
    return this.paymentHistory().reduce((total, payment) => total + payment.amount, 0);
  }

  getRemainingBalance(): number {
    const invoice = this.invoice();
    if (!invoice) return 0;

    const totalPaid = this.calculateTotalPaid(invoice);
    return invoice.amount - totalPaid;
  }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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

  getCommentTypeClass(type: CommentType): string {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';

    switch (type) {
      case CommentType.PAYMENT:
        return `${baseClasses} bg-green-100 text-green-800`;
      case CommentType.REMINDER:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case CommentType.DISPUTE:
        return `${baseClasses} bg-red-100 text-red-800`;
      case CommentType.SYSTEM:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getInitials(name: string): string {
    if (!name) return '';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}
