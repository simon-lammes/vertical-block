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
import {CreateBoardComponent} from './boards/create-board/create-board.component';
import {
  MatAutocompleteModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatSnackBar,
  MatSnackBarContainer,
  MatSnackBarModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthenticationComponent} from './authentication/authentication.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {BoardDetailComponent} from './boards/board-detail/board-detail.component';
import {StatsComponent} from './stats/stats.component';
import {MatRippleModule} from '@angular/material/core';
import {ProfileComponent} from './profile/profile.component';
import {AddMemberToBoardComponent} from './boards/add-member-to-board/add-member-to-board.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    BoardsComponent,
    CreateBoardComponent,
    AuthenticationComponent,
    BoardDetailComponent,
    StatsComponent,
    AuthenticationComponent,
    ProfileComponent,
    AddMemberToBoardComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    RouterModule.forRoot([
        {
          path: 'boards',
          component: BoardsComponent
        },
        {
          path: 'authentication',
          component: AuthenticationComponent
        },
        {
          path: 'boards/:boardId',
          component: BoardDetailComponent
        },
        {
          path: 'profile',
          component: ProfileComponent
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
    MatInputModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatExpansionModule,
    MatRippleModule
  ],
  providers: [
    AngularFireAuth,
    MatSnackBar,
    AngularFirestore
  ],
  entryComponents: [
    CreateBoardComponent,
    AddMemberToBoardComponent,
    MatSnackBarContainer
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
