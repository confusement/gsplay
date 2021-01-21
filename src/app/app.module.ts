import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//Deafult modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Code Editor
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

// Angular Matrial Modules
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSnackBarModule} from '@angular/material/snack-bar';

//My Components
import { GwindowComponent } from './components/gwindow/gwindow.component';
import { NgxSourceEditorComponent } from './components/ngx-source-editor/ngx-source-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    GwindowComponent,
    NgxSourceEditorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    FormsModule,
    MatDividerModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    MatSliderModule,
    MatSelectModule,
    MatGridListModule,
    MatSnackBarModule,
    CodemirrorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
