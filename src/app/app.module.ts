import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MainNavComponent} from './main-nav/main-nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {BoardsComponent} from './boards/boards.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MainMenuComponent} from './main-menu/main-menu.component';
import {CreateBoardComponent} from './boards/create-board/create-board.component';
import {MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    BoardsComponent,
    MainMenuComponent,
    CreateBoardComponent
  ],
  imports: [
    RouterModule.forRoot([
        {
          path: 'boards',
          component: BoardsComponent
        },
        {
          path: '**',
          redirectTo: 'boards'
        }
      ]
    ),
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  entryComponents: [
    CreateBoardComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
