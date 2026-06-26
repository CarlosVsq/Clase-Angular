import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Registrar los datos del locale usado en LOCALE_ID ('es-AR') para que DatePipe/CurrencyPipe funcionen
registerLocaleData(localeEsAr, 'es-AR');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
