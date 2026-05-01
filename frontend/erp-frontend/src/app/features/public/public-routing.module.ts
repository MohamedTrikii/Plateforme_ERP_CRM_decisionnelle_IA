import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { HomeComponent }         from './home/home.component';
import { AboutComponent }        from './about/about.component';
import { ServicesComponent }     from './services/services.component';
import { GalleryComponent }      from './gallery/gallery.component';
import { ContactComponent }      from './contact/contact.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '',         redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',     component: HomeComponent },
      { path: 'about',    component: AboutComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'gallery',  component: GalleryComponent },
      { path: 'contact',  component: ContactComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
