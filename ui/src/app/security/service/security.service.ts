import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, flatMap, map, take } from 'rxjs/operators';
import { HttpUtils } from '../../shared/support/http.utils';
import { ErrorUtils } from '../../shared/support/error.utils';
import { Security } from '../../shared/model/security.model';
import { State, getUsername, getRoles, getEnabled } from '../reducers/security.reducer';
import { loaded, logout } from '../actions/security.actions';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(
    private http: HttpClient,
    private store: Store<State>
  ) {}

  async canAccess(roles: string[]): Promise<boolean> {
    const grantedRoles = await this.store.pipe(select(getRoles)).pipe(take(1)).toPromise();
    return this.arrayContains(grantedRoles, roles);
  }

  private arrayContains(left: string[], right: string[]): boolean {
    if (right.length === 0) {
      return true;
    }
    const [arr1, arr2] = left.length < right.length ? [left, right] : [right, left];
    return arr1.some(i => arr2.includes(i));
  }

  loaded(enabled: boolean, username: string, roles: string[]) {
    this.store.dispatch(loaded({enabled, username, roles}));
  }

  securityEnabled(): Observable<boolean> {
    return this.store.pipe(select(getEnabled));
  }

  loggedinUser(): Observable<string> {
    return this.store.pipe(select(getUsername));
  }

  roles(): Observable<string[]> {
    return this.store.pipe(select(getRoles));
  }

  load(): Observable<Security> {
    const headers = HttpUtils.getDefaultHttpHeaders();
    return this.http.get<any>('/security/info', { headers })
      .pipe(
        map(Security.parse),
        catchError(ErrorUtils.catchError)
      );
  }

  logout(): Observable<Security> {
    const headers = HttpUtils.getDefaultHttpHeaders();
    return this.http.get('/logout', { headers: headers, responseType: 'text' })
      .pipe(
        flatMap(() => {
          this.store.dispatch(logout());
          return this.load();
        }),
        catchError(ErrorUtils.catchError)
      );
  }
}
