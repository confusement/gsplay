// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/markdown/markdown';
import './app/lib/hughsk_glsl.js'
// require('./glsl')(CodeMirror)
import 'codemirror/mode/clike/clike';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
