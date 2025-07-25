import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface PieSegment {
  color: string;
  dashArray: string;
  dashOffset: number;
}

interface LinePoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-widget.html',
  styleUrl: './chart-widget.scss'
})
export class ChartWidget implements OnInit {
  @Input() title: string = 'Chart';
  @Input() type: 'bar' | 'pie' | 'line' = 'bar';
  @Input() data: ChartData[] = [];
  @Input() loading: boolean = false;

  chartData = signal<ChartData[]>([]);

  ngOnInit(): void {
    // Mock chart data if none provided
    if (this.data.length === 0) {
      this.chartData.set([
        { label: 'Mathematics', value: 245, color: '#3B82F6' },
        { label: 'Physics', value: 30, color: '#10B981' },
        { label: 'Chemistry', value: 125, color: '#8B5CF6' },
        { label: 'Biology', value: 75, color: '#F59E0B' },
        { label: 'Computer Science', value: 20, color: '#EF4444' }
      ]);
    } else {
      this.chartData.set(this.data);
    }
  }

  // Bar Chart Methods
  getMaxValue(): number {
    const values = this.chartData().map(d => d.value);
    return values.length > 0 ? Math.max(...values) : 0;
  }

  getBarHeight(value: number): number {
    const maxValue = this.getMaxValue();
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  // Pie Chart Methods
  getTotalValue(): number {
    return this.chartData().reduce((sum, item) => sum + item.value, 0);
  }

  getPercentage(value: number): number {
    const total = this.getTotalValue();
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getPieSegments(): PieSegment[] {
    const total = this.getTotalValue();
    const circumference = 2 * Math.PI * 40; // radius = 40
    let cumulativePercentage = 0;

    return this.chartData().map(item => {
      const percentage = total > 0 ? item.value / total : 0;
      const dashLength = percentage * circumference;
      const dashOffset = -cumulativePercentage * circumference;

      cumulativePercentage += percentage;

      return {
        color: item.color,
        dashArray: `${dashLength} ${circumference}`,
        dashOffset: dashOffset
      };
    });
  }

  // Line Chart Methods
  getLinePoints(): LinePoint[] {
    const data = this.chartData();
    const maxValue = this.getMaxValue();
    const width = 400;
    const height = 200;
    const padding = 40;

    return data.map((item, index) => ({
      x: padding + (index * (width - 2 * padding)) / (data.length - 1),
      y: height - padding - ((item.value / maxValue) * (height - 2 * padding))
    }));
  }

  getLinePath(): string {
    const points = this.getLinePoints();
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      // Create smooth curve using quadratic bezier curves
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const controlPointX = (prevPoint.x + currentPoint.x) / 2;

      path += ` Q ${controlPointX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
    }

    return path;
  }

  // Utility Methods
  trackByLabel(index: number, item: ChartData): string {
    return item.label;
  }

  switchChart(type: 'bar' | 'pie'): void {
      const barChart = document.getElementById('bar-chart');
      const pieChart = document.getElementById('pie-chart');
      const buttons = document.querySelectorAll('.chart-type-btn');

      buttons.forEach(btn => btn.classList.remove('active'));

      if (type === 'bar') {
          if (barChart) barChart.style.display = 'block';
          if (pieChart) pieChart.style.display = 'none';
          if (buttons[0]) buttons[0].classList.add('active');
      } else {
          if (barChart) barChart.style.display = 'none';
          if (pieChart) pieChart.style.display = 'flex';
          if (buttons[1]) buttons[1].classList.add('active');
      }
  }

  // Math utility for template
  Math = Math;
}
