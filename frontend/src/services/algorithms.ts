import { reactive } from 'vue';
import { api } from 'boot/axios';
import { LocalStorage } from 'quasar';

export interface IFlowchartCategory {
  id: number,
  name: string,
}

export interface IAlgorithm {
  id: number,
  user_id?: number,
  title: string,
  description: string,
  author: string,
  version: string,
  categories?: IFlowchartCategory[],
  updated_at: string,
}

const emptyFlowchart = {
  id: 0,
  title: '',
  description: '',
  author: '',
  version: '',
  updated_at: '',
  categories: [],
};

export interface INode {
  id: number,
  algorithm_id: number,
  node_id: string,
  node_type: string,
  label: string,
}

export interface IAlgorithmThoroughSearchResultItem {
  id: number,
  title: string,
  description: string,
  nodes: INode[],
}

export interface IAlgorithmThoroughSearchResult {
  [key: number]: IAlgorithmThoroughSearchResultItem
}

const resource = 'algorithms';

class Algorithms {
  public data: {
    loading: boolean,
    showEditDialog: boolean,
    algorithms: IAlgorithm[],
    algorithm: IAlgorithm,
    algorithm_categories: { id: number, name: string }[],
    searchKeyword: string,
    searchCategory: { id: number, name: string } | null,
    searchUser: { id: number, name: string } | null,
    searchResults: IAlgorithm[],
    totalSearchResult: number | null,
  } = reactive({
      loading: false,
      showEditDialog: false,
      algorithms: [],
      algorithm: { ...emptyFlowchart },
      algorithm_categories: [],
      searchKeyword: '',
      searchCategory: null,
      searchUser: null,
      searchResults: [],
      totalSearchResult: null,
    });

  get flowchartsList() {
    if (this.data.totalSearchResult !== null) return this.data.searchResults;

    return this.data.algorithms;
  }

  public async getAlgorithm(id: number) {
    try {
      this.data.loading = true;

      const { data: algorithm }: { data: IAlgorithm } = await api.get(`${resource}/${id}`);

      return Promise.resolve(algorithm);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.loading = false;
      }, 1000);
    }
  }

  public async getAll(listAllAlgorithms = false) {
    try {
      this.data.loading = true;

      const { data: flowcharts }: { data: IAlgorithm[] } = await api.get(`${resource}?list_all_algorithms=${listAllAlgorithms}`);

      if (flowcharts) {
        this.data.searchResults = [...flowcharts];
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.loading = false;
      }, 1000);
    }
  }

  public async getUserAlgorithms(userId: number) {
    try {
      this.data.loading = true;

      const { data: flowcharts }: { data: IAlgorithm[] } = await api.get(`${resource}/user/${userId}`);

      if (flowcharts) {
        this.data.algorithms = [...flowcharts];
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.loading = false;
      }, 1000);
    }
  }

  public async getAlgorithmCategories(algorithmId?: number) {
    try {
      const { data: categories }: {
        data: { id: number, name: string }[],
      } = await api.get(`${resource}/algorithm-categories/${algorithmId || this.data.algorithm.id}`);

      if (categories) {
        this.data.algorithm_categories = [...categories];
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public setAlgorithmCategories() {
    this.data.algorithm.categories = [...this.data.algorithm_categories];
  }

  public async thorough_search(keyword: string, searchAllAlgorithms = false) {
    try {
      this.data.loading = true;

      const { data: results }: {
        data: IAlgorithmThoroughSearchResult[],
      } = await api.get(`${resource}/thorough-search?keyword=${keyword}&search_all_algorithms=${searchAllAlgorithms}`);

      return Promise.resolve(results);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.loading = false;
      }, 1000);
    }
  }

  public async search() {
    try {
      this.data.loading = true;

      this.data.searchResults = [];
      this.data.totalSearchResult = 0;

      let url = `${resource}/search?`;
      url += `keyword=${this.data.searchKeyword}`;
      url += `&category_id=${this.data.searchCategory?.id || 0}`;
      url += `&user_id=${this.data.searchUser?.id || 0}`;

      const { data: flowchartsFound }: { data: IAlgorithm[] } = await api.get(url);

      if (flowchartsFound && flowchartsFound.length) {
        this.data.searchResults = [...flowchartsFound];

        this.data.totalSearchResult = flowchartsFound.length;
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.loading = false;
      }, 1000);
    }
  }

  public startCreating() {
    this.data.algorithm = { ...emptyFlowchart };

    void this.toggleEditDialog();
  }

  public async viewAlgorithmData(algorithm: IAlgorithm) {
    this.data.algorithm = { ...algorithm };

    // convert to brazilian date (DD/MM/YYYY)
    // this.data.algorithm.updated_at = date.toBR(flowchart.updated_at);

    await this.toggleEditDialog();
  }

  public async update() {
    try {
      this.data.loading = true;

      const finalResource = `${resource}/${this.data.algorithm.id}`;

      await api.put(finalResource, {
        ...this.data.algorithm,
        categories: this.data.algorithm.categories?.length
          ? this.data.algorithm.categories.map((category) => category.id) : [],
        user_id: LocalStorage.getItem('user'),
      });

      await this.toggleEditDialog();

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async save() {
    try {
      this.data.loading = true;

      await api.post(resource, {
        ...this.data.algorithm,
        categories: this.data.algorithm.categories?.length
          ? this.data.algorithm.categories.map((category) => category.id) : [],
        user_id: LocalStorage.getItem('user'),
        public: 0,
      });

      await this.toggleEditDialog();

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async delete() {
    try {
      await api.delete(`${resource}/${this.data.algorithm.id}`);

      await this.getAll();

      await this.toggleEditDialog();

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public clearSearch() {
    this.data.searchResults = [];
    this.data.totalSearchResult = null;
    this.data.searchKeyword = '';
    this.data.searchUser = null;
  }

  public async toggleEditDialog() {
    this.data.showEditDialog = !this.data.showEditDialog;

    if (this.data.showEditDialog && this.data.algorithm.id) {
      await this.getAlgorithmCategories();
    }
  }
}

export default Algorithms;
