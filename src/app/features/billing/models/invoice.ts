export interface Invoice {
  id: string;
  parentId: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  issueDate: Date;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentDate?: Date;
  paymentMethod?: string;
  comments: InvoiceComment[];
  lastModified: Date;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  courseId: string;
  courseName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  period?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface InvoiceComment {
  id: string;
  comment: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  type: CommentType;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SENT = 'sent',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum CommentType {
  GENERAL = 'general',
  PAYMENT = 'payment',
  REMINDER = 'reminder',
  DISPUTE = 'dispute',
  SYSTEM = 'system'
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}
