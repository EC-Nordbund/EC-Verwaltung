import { auth } from './plugins/auth';

export const fetch: typeof window['fetch'] = (i, o) =>
  window.fetch(i, {
    ...o,
    headers: { ...((o && o.headers) || {}), authorization: auth.authToken }
  });
