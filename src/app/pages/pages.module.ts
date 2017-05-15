import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';
import { AppTranslationModule } from '../app.translation.module';

import { Pages } from './pages.component';
import { RouteController } from '../../services/route.controller.service';
import { AuthenticationService } from '../../services/auth.service';
import { LocalStorageService } from 'angular-2-local-storage';



@NgModule({
  imports: [CommonModule, AppTranslationModule, NgaModule, routing],
  declarations: [Pages],
  providers: [
    RouteController,
    AuthenticationService,
    LocalStorageService
  ]
})
export class PagesModule {
}
