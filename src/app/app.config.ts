import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),

    // ✅ تسجيل الـ Class Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    //    // ✅ Toastr

    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
    }).providers!,
  ],
};
