import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { rateLimitInterceptor } from './shared/interceptors/rate-limit.interceptor';
import { AdminRoutingModule } from './admin/admin-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([rateLimitInterceptor])
    ),
    importProvidersFrom(
      MatDialogModule,
      AdminRoutingModule
    )
  ]
};
