import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  customers: Customer[] = [];
  totalItems  = 0;
  page        = 0;
  pageSize    = 10;
  search      = '';
  loading     = false;
  displayedColumns = ['name', 'email', 'phone', 'company', 'status', 'actions'];

  constructor(
    private customerService: CustomerService,
    private snackBar:        MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.customerService.getAll(this.page, this.pageSize, this.search).subscribe({
      next: page => {
        this.customers  = page.content;
        this.totalItems = page.totalElements;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(value: string): void {
    this.search = value;
    this.page   = 0;
    this.load();
  }

  onPage(event: any): void {
    this.page     = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  delete(id: number): void {
    if (!confirm('Delete this customer?')) return;
    this.customerService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Customer deleted', 'Close', { duration: 3000 });
        this.load();
      }
    });
  }
}
