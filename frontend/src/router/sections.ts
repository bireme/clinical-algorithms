import { USERS_INDEX } from 'src/router/routes/users';
import { ALGORITHMS_MAINTENANCE_INDEX, ALGORITHMS_SEARCH } from 'src/router/routes/algorithms';
import { ALGORITHMS_CATEGORIES_INDEX } from 'src/router/routes/algorithms_categories';

export interface IMainMenuSection {
  name: string,
  icon: string,
  items: {
    name: string,
    icon: string,
    label: string,
  }[],
}

export const allSections = [
  {
    name: 'Registros básicos',
    icon: 'img:/imgs/main-menu/book.png',
    items: [
      {
        name: USERS_INDEX,
        icon: 'img:/imgs/main-menu/user.png',
        label: 'Usuarios',
      },
      {
        name: ALGORITHMS_CATEGORIES_INDEX,
        icon: 'img:/imgs/main-menu/categories.png',
        label: 'Categorías',
      },
    ],
  },
  {
    name: 'Algoritmos',
    icon: 'img:/imgs/main-menu/algorithms.png',
    items: [
      {
        name: ALGORITHMS_MAINTENANCE_INDEX,
        icon: 'img:/imgs/main-menu/mantainance.png',
        label: 'Mantenimiento',
      },
      {
        name: ALGORITHMS_SEARCH,
        icon: 'img:/imgs/main-menu/listing.png',
        label: 'Búsqueda',
      },
    ],
  },
];

export const restrictedSections = [
  {
    name: 'Algoritmos',
    icon: 'img:/imgs/main-menu/algorithms.png',
    items: [
      {
        name: ALGORITHMS_MAINTENANCE_INDEX,
        icon: 'img:/imgs/main-menu/mantainance.png',
        label: 'Mantenimiento',
        maintainer: true,
      },
      {
        name: ALGORITHMS_SEARCH,
        icon: 'img:/imgs/main-menu/listing.png',
        label: 'Búsqueda',
        maintainer: false,
      },
    ],
  },
];
