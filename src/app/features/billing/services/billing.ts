import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Invoice, InvoiceStatus, InvoiceComment, PaymentRecord, CommentType } from '../models/invoice';
import { FakeApi } from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private fakeApiService = inject(FakeApi);
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();

  getInvoices(): Observable<Invoice[]> {
    return this.fakeApiService.getInvoices();
  }

  getInvoiceById(id: string): Observable<Invoice | undefined> {
    return this.fakeApiService.getInvoiceById(id);
  }

  getInvoicesByParent(parentId: string): Observable<Invoice[]> {
    return this.fakeApiService.getInvoicesByParent(parentId);
  }

  getInvoicesByStudent(studentId: string): Observable<Invoice[]> {
    return this.fakeApiService.getInvoicesByStudent(studentId);
  }

  getInvoicesByStatus(status: InvoiceStatus): Observable<Invoice[]> {
    return this.fakeApiService.getInvoicesByStatus(status);
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Observable<Invoice> {
    return this.fakeApiService.createInvoice(invoice);
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    return this.fakeApiService.updateInvoice(id, updates);
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus, userId: string, comment?: string): Observable<Invoice> {
    return this.fakeApiService.updateInvoiceStatus(id, status, userId, comment);
  }

  addInvoiceComment(invoiceId: string, comment: string, type: CommentType, userId: string, userName: string): Observable<Invoice> {
    return this.fakeApiService.addInvoiceComment(invoiceId, comment, type, userId, userName);
  }

  recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Observable<Invoice> {
    return this.fakeApiService.recordPayment(invoiceId, payment);
  }

  generateMonthlyInvoices(month: number, year: number): Observable<Invoice[]> {
    return this.fakeApiService.generateMonthlyInvoices(month, year);
  }

  sendInvoiceReminder(invoiceId: string): Observable<boolean> {
    return this.fakeApiService.sendInvoiceReminder(invoiceId);
  }

  getPaymentHistory(invoiceId?: string): Observable<PaymentRecord[]> {
    return this.fakeApiService.getPaymentHistory(invoiceId);
  }

  getBillingStats(startDate: Date, endDate: Date): Observable<any> {
    return this.fakeApiService.getBillingStats(startDate, endDate);
  }
}
