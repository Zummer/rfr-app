import {AnyAction, Dispatch} from 'redux';
import {IAppUser, ILoginParams} from '../Models';
import {
  CALL_API,
  CALL_API_ACTION,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  SET_LOGIN_FORM_ERRORS,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
} from '../types';
import {goHome} from '../actions';
import {addFlashMessage} from './flashMessages';
import {EFlashMessageType, ERequestActionStatus} from '../Enums';
import {v4} from 'uuid';
import jwtDecode from 'jwt-decode';

export const setFormErrors = (errors: any): AnyAction => ({
  type: SET_LOGIN_FORM_ERRORS,
  payload: errors,
});

export function loggedIn(user: IAppUser): AnyAction {
  return {
    type: USER_LOGGED_IN,
    payload: user,
  };
}

export function logout(): AnyAction {
  localStorage.removeItem('jwtToken');
  document.cookie = 'jwtToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  return {
    type: USER_LOGGED_OUT,
  };
}

export const login = (params: ILoginParams) => async (
  dispatch: Dispatch
): Promise<void> => {
  try {
    const action: any = await dispatch({
      type: CALL_API_ACTION,
      [CALL_API]: {
        types: [LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE],
        method: 'POST',
        endpoint: '/login',
        payload: {params},
        requestBody: params,
      },
    });

    switch (action.status) {
      case ERequestActionStatus.SUCCESS:
        const jwtToken = action.payload.response.jwtToken;
        localStorage.setItem('jwtToken', jwtToken);
        dispatch(loggedIn(jwtDecode(jwtToken)));

        dispatch(goHome());
        addFlashMessage({
          id: v4(),
          type: EFlashMessageType.SUCCESS,
          text: 'Вы успешно вошли!',
        })(dispatch);
        break;
      case ERequestActionStatus.FAIL:
        addFlashMessage({
          id: v4(),
          type: EFlashMessageType.ERROR,
          text: action.errorMessage,
        })(dispatch);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }
};
