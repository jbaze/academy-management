import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '../../../core/services/loading';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.scss']
})
export class LoadingSpinner {
  private loadingService = inject(Loading);

  loading$ = this.loadingService.loading$;
}
