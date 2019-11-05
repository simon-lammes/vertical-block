import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {QuickAction} from './quick-action.model';
import {Observable} from 'rxjs';
import {map, startWith, take} from 'rxjs/operators';
import {SaveBoardDialogComponent} from '../../boards/save-board-dialog/save-board-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {DialogService} from '../../shared/dialog/dialog.service';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../authentication/authentication.service';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent implements OnInit {
  quickActionForm: FormGroup;
  quickActions: QuickAction[] = [
    {
      name: 'Create new board',
      action: () => this.createNewBoard()
    },
    {
      name: 'Edit profile',
      action: () => this.router.navigateByUrl('/profile')
    },
    {
      name: 'Login',
      action: () => this.login()
    },
    {
      name: 'Logout',
      action: () => this.logout()
    },
    {
      name: 'Show all boards',
      action: () => this.router.navigateByUrl('/boards')
    }
  ];
  filteredQuickActions$: Observable<QuickAction[]>;

  get quickActionNameControl(): AbstractControl {
    return this.quickActionForm.controls.quickActionName;
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.quickActionForm = this.formBuilder.group({
      quickActionName: ''
    });
    this.filteredQuickActions$ = this.quickActionNameControl.valueChanges.pipe(
      // The first search term is an empty string
      startWith(''),
      map(userInputAny => {
        const userInput: string = userInputAny;
        // If the user input does not have the method toLowerCase it cannot be a string and is therefore no string.
        // This is the case when the user clicks on an autocomplete hint
        // so that the input holds an object of type QuickAction.
        if (!userInput.toLowerCase) {
          return this.quickActions;
        }
        const searchTerms = (userInput as string).toLowerCase().split(' ');
        // The regex pattern looks whether every search term is contained in action name.
        const regexPattern = searchTerms.reduce(
          (previousValue, currentValue) => previousValue + `(?=.*${currentValue})`,
          '^'
        );
        return this.quickActions.filter(quickAction => {
          return !!quickAction.name.toLowerCase().match(regexPattern);
        });
      })
    );
  }

  inputChange(userInput: any) {
    const quickAction: QuickAction = userInput;
    if (quickAction.action) {
      // Obviously the user picked a quickAction, so it is time to do the action and reset the input control.
      this.quickActionNameControl.patchValue('');
      quickAction.action();
    }
  }

  createNewBoard() {
    this.dialog.open(SaveBoardDialogComponent, {
      ...this.dialogService.getDefaultDialogConfiguration(),
      data: {}
    });
  }

  private async login() {
    if (await this.authenticationService.getIsUserAuthenticated$().pipe(take(1)).toPromise()) {
      alert('You are already logged in');
      return;
    }
    this.router.navigateByUrl('/authentication');
  }

  private async logout() {
    if (await this.authenticationService.getIsUserAuthenticated$().pipe(take(1)).toPromise()) {
      this.authenticationService.logout();
    } else {
      alert('You can only logout if you are logged in.');
    }
  }
}
