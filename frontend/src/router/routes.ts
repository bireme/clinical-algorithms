import { RouteRecordRaw } from 'vue-router';
import Account from './routes/account';
import Home from './routes/home';
import Users from './routes/users';
import AlgorithmsCategories from './routes/algorithms_categories';

import Algorithms, {
  ALGORITHMS_PUBLIC_PRINT,
  ALGORITHMS_PUBLIC_PRINT_PATH,
  ALGORITHMS_PUBLIC_SEARCH,
} from './routes/algorithms';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('layouts/public-layout.vue'),
    children: [
      {
        path: '',
        name: ALGORITHMS_PUBLIC_SEARCH,
        component: () => import('pages/algorithm/algorithms-search-page.vue'),
      },
    ],
  },
  {
    path: '',
    component: () => import('layouts/admin-layout.vue'),
    children: [
      ...Home,
      ...Users,
      ...Algorithms,
      ...AlgorithmsCategories,
    ],
  },
  {
    path: `/${ALGORITHMS_PUBLIC_PRINT_PATH}`,
    component: () => import('layouts/login-layout.vue'),
    children: [
      {
        path: '',
        name: ALGORITHMS_PUBLIC_PRINT,
        component: () => import('pages/editor/print-page.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/login-layout.vue'),
    children: [
      ...Account,
    ],
  },
];

export default routes;
