import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule }    from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ShellComponent }   from './shell/shell.component';
import { HeaderComponent }  from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [ShellComponent, HeaderComponent, SidebarComponent],
  imports: [SharedModule, MatSidenavModule, MatListModule, MatToolbarModule],
  exports: [ShellComponent],
})
export class LayoutModule {}
