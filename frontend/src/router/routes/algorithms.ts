export const ALGORITHMS_MAINTENANCE_INDEX = 'algorithms';
export const ALGORITHMS_SEARCH = 'search';
export const ALGORITHMS_EDITOR = 'editor';

export const ALGORITHMS_PUBLIC_EDITOR_PATH = '/editor';
export const ALGORITHMS_PUBLIC_EDITOR = 'public-editor';

export const ALGORITHMS_PUBLIC_PRINT_PATH = 'print';
export const ALGORITHMS_PUBLIC_PRINT = 'public-print';

export const ALGORITHMS_PUBLIC_SEARCH = 'public-search';

const routes = [
  {
    path: ALGORITHMS_PUBLIC_EDITOR_PATH,
    name: ALGORITHMS_PUBLIC_EDITOR,
    component: () => import('pages/editor/editor-page.vue'),
  },
  {
    path: `/admin/${ALGORITHMS_MAINTENANCE_INDEX}`,
    name: ALGORITHMS_MAINTENANCE_INDEX,
    component: () => import('pages/algorithm/algorithms-maintenance-page.vue'),
  },
  {
    path: `/admin/${ALGORITHMS_EDITOR}`,
    name: ALGORITHMS_EDITOR,
    component: () => import('pages/editor/editor-page.vue'),
  },
  {
    path: `/admin/${ALGORITHMS_SEARCH}`,
    name: ALGORITHMS_SEARCH,
    component: () => import('pages/algorithm/algorithms-search-page.vue'),
  },
];

export default routes;
