import { reactive } from 'vue';
import { api } from 'boot/axios';
import { LocalStorage } from 'quasar';

const emptyUser = {
  id: 0,
  name: '',
  email: '',
  password: '',
  phone: '',
  maintainer: false,
  master: false,
  updatedAt: '',
};

export interface IUser {
  id?: number,
  name: string,
  email: string,
  password: string,
  phone: string,
  maintainer: boolean,
  master: boolean,
  updatedAt: string,
}

class Users {
  data: {
    loading: boolean,
    showEditDialog: boolean,
    users: IUser[],
    user: IUser,
    searchResults: IUser[] | null,
    totalSearchResult: number | null,
  } = reactive({
      loading: false,
      showEditDialog: false,
      users: [],
      user: { ...emptyUser },
      searchResults: null,
      totalSearchResult: null,
    });

  constructor() {
    this.data.users = [];
  }

  get usersList() {
    if (this.data.totalSearchResult !== null) return this.data.searchResults;

    return this.data.users;
  }

  public async search(keyword: string) {
    try {
      this.data.loading = true;

      this.data.searchResults = [];
      this.data.totalSearchResult = 0;

      const { data } = await api.get(`users/search?keyword=${keyword}`);

      if (data && data.length) {
        this.data.searchResults = [...data];

        this.data.totalSearchResult = data.length;
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.data.loading = false;
    }
  }

  public startCreatingUser() {
    this.data.user = { ...emptyUser };

    this.toggleEditDialog();
  }

  public editUser(user: IUser) {
    this.data.user = { ...user };

    // hide original password hash
    this.data.user.password = '';

    // convert 0 / 1 to false / true
    this.data.user.maintainer = !!user.maintainer;
    this.data.user.master = !!user.master;

    this.toggleEditDialog();
  }

  public async get_public() {
    try {
      const { data } = await api.get('users/public');

      this.data.users = [...data];

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async get() {
    try {
      const token = LocalStorage.getItem('token');

      if (!token) return Promise.resolve(false);

      const { data } = await api.get('users');

      this.data.users = [...data];

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async create() {
    try {
      this.data.loading = true;

      await api.post('users', {
        ...this.data.user,
      });

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.toggleEditDialog();

      this.data.loading = false;
    }
  }

  public async update() {
    try {
      this.data.loading = true;

      await api.put('users', {
        ...this.data.user,
        phone: this.data.user.phone || '',
      });

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.toggleEditDialog();

      this.data.loading = false;
    }
  }

  public async delete() {
    try {
      this.data.loading = true;

      await api.delete(`users/${this.data.user.id}`);

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.toggleEditDialog();

      this.data.loading = false;
    }
  }

  public clearSearch() {
    this.data.searchResults = null;
    this.data.totalSearchResult = null;
  }

  public toggleEditDialog() {
    this.data.showEditDialog = !this.data.showEditDialog;
  }

  public getUserName(userId: number) {
    return this.data.users.find((user) => user.id === userId)?.name || 'No definido';
  }
}

export default Users;
