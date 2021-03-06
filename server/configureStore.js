// import {createMemoryHistory as createHistory} from 'history';
// import { NOT_FOUND } from 'redux-first-router'
import configureStore from '../src/configureStore';

export default async (ctx) => {
  const jwToken = ctx.cookies.get('jwtToken'); // see server/index.js to change jwToken

  const preLoadedState = {jwToken}; // onBeforeChange will authenticate using this

  // const history = createHistory({initialEntries: [ctx.path]});
  const {store, thunk} = configureStore(preLoadedState, [ctx.path]);

  // if not using onBeforeChange + jwTokens, you can also async authenticate
  // here against your db (i.e. using req.cookies.sessionId)

  let location = store.getState().location;
  if (doesRedirect(location, ctx)) return false;

  // using redux-thunk perhaps request and dispatch some app-wide state as well, e.g:
  // await Promise.all([store.dispatch(myThunkA), store.dispatch(myThunkB)])

  await thunk(store); // THE PAYOFF BABY!

  location = store.getState().location; // remember: state has now changed
  if (doesRedirect(location, ctx)) return false; // only do this again if ur thunks have redirects

  // const status = location.type === NOT_FOUND ? 404 : 200
  // res.status(status)
  return store;
};

// тут надо разобраться что к чему...
const doesRedirect = ({kind, pathname}, ctx) => {
  if (kind === 'redirect') {
    ctx.redirect(302, pathname);
    return true;
  }
};
