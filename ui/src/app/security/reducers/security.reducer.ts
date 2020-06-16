import { createReducer, on } from '@ngrx/store';
import * as SecurityActions from '../actions/security.actions';
import * as fromRoot from '../../reducers/reducer';

export const securityFeatureKey = 'security';

export interface SecurityState {
  enabled: boolean;
  username: string;
  roles: string[];
}

export interface State extends fromRoot.State {
  [securityFeatureKey]: SecurityState;
}

export const getEnabled = (state: State) => {
  return state[securityFeatureKey].enabled;
};

export const getUsername = (state: State) => {
  return state[securityFeatureKey].username;
};

export const getRoles = (state: State) => {
  return state[securityFeatureKey].roles;
};

const initialState: SecurityState = {
  enabled: true,
  username: undefined,
  roles: []
};

export const reducer = createReducer(
  initialState,
  on(SecurityActions.loaded, (state, props) => ({ enabled: state.enabled, username: props.username, roles: props.roles })),
  on(SecurityActions.logout, state => ({ enabled: state.enabled, username: undefined, roles: [] }))
);
