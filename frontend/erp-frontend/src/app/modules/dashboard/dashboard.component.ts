import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardKpi } from '../../core/models/order.model';
import { ThemeService } from '../../shared/theme/theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  kpi: DashboardKpi | null = null;
  loading = true;
  companyName = '';

  constructor(
    private dashboardService: DashboardService,
    private themeService:     ThemeService
  ) {}

  ngOnInit(): void {
    this.companyName = this.themeService.getCompanyName();
    this.loadKpis();
  }

  loadKpis(): void {
    this.dashboardService.getKpis().subscribe({
      next:  kpi  => { this.kpi = kpi; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  refresh(): void {
    this.loading = true;
    this.loadKpis();
  }
}
