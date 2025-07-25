import { Routes } from '@angular/router';

export const billingRoutes: Routes = [
  { path: '', redirectTo: '/billing/invoices', pathMatch: 'full' },
  {
    path: 'invoices',
    loadComponent: () => import('./invoice-list/invoice-list').then(m => m.InvoiceList)
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./invoice-form/invoice-form').then(m => m.InvoiceForm)
  },
  {
    path: 'invoices/:id',
    loadComponent: () => import('./invoice-detail/invoice-detail').then(m => m.InvoiceDetail)
  },
  {
    path: 'invoices/:id/edit',
    loadComponent: () => import('./invoice-form/invoice-form').then(m => m.InvoiceForm)
  },
  {
    path: 'payments',
    loadComponent: () => import('./payment-history/payment-history').then(m => m.PaymentHistory)
  },
  {
    path: 'reports',
    loadComponent: () => import('./monthly-reports/monthly-reports').then(m => m.MonthlyReports)
  },
  {
    path: 'settings',
    loadComponent: () => import('./billing-settings/billing-settings').then(m => m.BillingSettings)
  }
];
