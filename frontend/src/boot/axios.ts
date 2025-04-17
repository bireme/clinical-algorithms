import { boot } from 'quasar/wrappers';
// import axios, { AxiosInstance } from 'axios';
import axios from 'axios';
import { LocalStorage } from 'quasar';

/* declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
} */

function getAuthorizationHeader() {
  const token = LocalStorage.getItem('token') as string;

  return {
    Token: token || '',
    'Content-Type': 'application/json',
  };
}

const api = axios.create({
  baseURL: process.env.API_URL,
});

// INTERCEPTOR TO INJECT THE BEARER TOKEN
api.interceptors.request.use(
  (config) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.headers = getAuthorizationHeader();

    return config;
  },
  (error) => Promise.reject(error),
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
