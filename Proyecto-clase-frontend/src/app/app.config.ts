import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { SocialLoginModule, SOCIAL_AUTH_CONFIG,SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(SocialLoginModule),

    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider:
              new GoogleLoginProvider('336786427393-8vee6l6vmicqaovpu60qs6cefsslof4s.apps.googleusercontent.com')
          }
        ],
        onError: (err) => console.error('Error Auth:', err)
      } as SocialAuthServiceConfig
    }
  ]
};
