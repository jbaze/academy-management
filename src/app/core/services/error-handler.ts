import { Injectable, inject } from '@angular/core';
import { NotificationService} from './notification';
import { Loading} from './loading';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandler {
  private notificationService = inject(NotificationService);
  private loadingService = inject(Loading);

  handleError(error: any, context?: string): void {
    console.error('Error occurred:', error);

    // Stop any loading indicators
    this.loadingService.forceStop();

    // Extract error message
    let errorMessage = 'An unexpected error occurred';

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    }

    // Add context if provided
    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }

    // Show error notification
    this.notificationService.showError(errorMessage);
  }

  handleHttpError(status: number, error: any): string {
    switch (status) {
      case 400:
        return error?.error?.message || 'Bad request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error?.error?.message || 'An error occurred. Please try again.';
    }
  }
}
