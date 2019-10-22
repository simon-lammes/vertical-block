import {Injectable} from '@angular/core';
import {MatDialogConfig} from '@angular/material';

/**
 * This service has the purpose of exposing shared configurations for all dialogs
 * in this application so that all dialogs share the same look and feel.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() {
  }

  getDefaultDialogConfiguration(): MatDialogConfig {
    return {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '98%',
      width: '98%'
    };
  }
}
