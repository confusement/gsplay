import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//Deafult modules
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './components/test/test.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Code Editor
import { FormsModule } from '@angular/forms';

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

//My Components
import { GwindowComponent } from './components/gwindow/gwindow.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    GwindowComponent
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
    MatSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
