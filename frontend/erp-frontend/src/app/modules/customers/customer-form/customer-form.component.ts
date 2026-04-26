import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnInit {

  form!: FormGroup;
  editId: number | null = null;
  loading = false;
  saving  = false;

  statusOptions = ['ACTIVE', 'INACTIVE', 'PROSPECT'];

  constructor(
    private fb:      FormBuilder,
    private route:   ActivatedRoute,
    private router:  Router,
    private service: CustomerService,
    private snack:   MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      phone:   [''],
      address: [''],
      company: [''],
      status:  ['ACTIVE'],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = +idParam;
      this.loading = true;
      // CustomerService would need a getById – using getAll with search as workaround
      // or you can add getById to CustomerService
      this.service.getAll(0, 1000, '').subscribe(page => {
        const customer = page.content.find(c => c.id === this.editId);
        if (customer) {
          this.form.patchValue(customer);
        }
        this.loading = false;
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.editId
      ? this.service.update(this.editId, this.form.value)
      : this.service.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.snack.open('Customer saved!', 'Close', { duration: 3000 });
        this.router.navigate(['/customers']);
      },
      error: () => { this.saving = false; }
    });
  }
}
