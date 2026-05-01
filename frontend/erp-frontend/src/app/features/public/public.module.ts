import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material (subset needed for public pages)
import { MatIconModule }            from '@angular/material/icon';
import { MatButtonModule }          from '@angular/material/button';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedModule } from '../../shared/shared.module';

import { PublicRoutingModule }   from './public-routing.module';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { HomeComponent }         from './home/home.component';
import { AboutComponent }        from './about/about.component';
import { ServicesComponent }     from './services/services.component';
import { GalleryComponent }      from './gallery/gallery.component';
import { ContactComponent }      from './contact/contact.component';

@NgModule({
  declarations: [
    PublicLayoutComponent,
    HomeComponent,
    AboutComponent,
    ServicesComponent,
    GalleryComponent,
    ContactComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    SharedModule,
    PublicRoutingModule,
  ],
})
export class PublicModule {}
