import Editor from 'src/services/editor/index';
import { api } from 'boot/axios';
import { reactive } from 'vue';
import { CustomElement } from 'src/services/editor/elements/custom-elements';

const RESOURCE_ALGORITHM = 'algorithms';
const RESOURCE = 'algorithms/graph';

export interface IEditorData {
  mode: string,
  graph: {
    id: number,
    algorithm_id: number,
    updated_at: string,
  },
  algorithm: {
    id: number,
    title: string,
    description: string,
    version: string,
    updated_at: string,
  },
  loading: boolean,
  saving: boolean,
  saved: boolean | null,
  savingTimeout: ReturnType<typeof setTimeout> | null,
  exportingPDF: boolean,
}

class Graph {
  editor: Editor;

  data: IEditorData = reactive({
    mode: '',
    graph: {
      id: 0,
      algorithm_id: 0,
      updated_at: '',
    },
    algorithm: {
      id: 0,
      title: '',
      description: '',
      version: '',
      updated_at: '',
    },
    loading: false,
    saving: false,
    saved: null,
    savingTimeout: null,
    exportingPDF: false,
  });

  constructor(editor: Editor) {
    this.editor = editor;
  }

  get isNotSaved() {
    return this.data.saved === false;
  }

  get isSaved() {
    return this.data.saved === true || this.data.saved === null;
  }

  public get lastUpdate() {
    return this.data.graph.updated_at;
  }

  private async setGraph(graphId: number | string) {
    try {
      const { data }: { data: {
          id: number,
          algorithm_id: number,
          graph: string,
          updated_at: string,
      } } = await api.get(`${RESOURCE}/${graphId}`);

      this.data.graph.id = data.id;
      this.data.graph.algorithm_id = data.algorithm_id;
      this.data.graph.updated_at = data.updated_at;

      if (data.graph) {
        // open graph...
        const graphJson = JSON.parse(data.graph);

        if (graphJson) {
          this.editor.data.graph.fromJSON(graphJson);

          const allElements = this.editor.data.graph.getElements();

          this.editor.element.input.setValues(allElements);
          this.editor.element.textarea.setValues(allElements);

          if (!this.editor.data.readOnly) {
            this.editor.element.createElementsTools(allElements);
            this.editor.element.textarea.createEventHandlers();
          }

          // reset scroll because of createEventHandlers method
          // that focus on input fields
          // which changes the scroll
          Editor.setScroll({ x: 0, y: 0 });

          await this.editor.element.createAllRecommendationsTotals();

          // READ ONLY MODE
          if (this.editor.data.readOnly) {
            this.editor.element.textarea.disableAll();

            this.editor.element.createRecommendations();

            // this.editor.element.showAllTools();

            if (this.editor.route.query.node) {
              this.editor.element.select(String(this.editor.route.query.node));

              this.editor.element.centerViewOnSelected();
            }
          }
        }
      }

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async setAlgorithm() {
    try {
      const { data } = await api.get(`${RESOURCE_ALGORITHM}/${this.data.graph.algorithm_id}`);

      this.data.algorithm = { ...data };

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async open(graphId: number | string) {
    try {
      this.data.loading = true;

      await this.setGraph(graphId);

      await this.setAlgorithm();

      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      this.data.loading = false;
    }
  }

  public notSaved(value = false) {
    this.data.saved = value;

    // if (this.data.savingTimeout) {
    //   clearTimeout(this.data.savingTimeout);
    // }
    //
    // this.data.savingTimeout = setTimeout(() => {
    //   void this.save();
    // }, 2000);
  }

  public saved() {
    this.data.saved = true;
  }

  public async save() {
    try {
      this.data.saving = true;

      const { data } = await api.put(`${RESOURCE}/${this.data.graph.id}`, {
        id: this.data.graph.id,
        graph: JSON.stringify(this.editor.data.graph.toJSON()),
        algorithm_id: this.data.graph.algorithm_id,
      });

      this.data.graph.updated_at = data.updated_at;

      this.saved();

      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setTimeout(() => {
        this.data.saving = false;
      }, 1000);
    }
  }

  /**
   * Swap some elements in order to be exported as PDF correctly
   */
  public setToPrint() {
    const allElements = this.editor.element.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        const elementType = element.prop('type');

        if ([CustomElement.ACTION, CustomElement.EVALUATION].includes(elementType)) {
          const textarea = this.editor.element.textarea.getFromEditorElement(element.id);

          if (textarea) {
            const { value } = textarea;

            const {
              x,
              y,
            } = element.position();

            textarea.remove();

            this.editor.element.create.PrintLabel({ x, y, text: value });
          }
        } else if (elementType === CustomElement.RECOMMENDATION_TOGGLER) {
          element.remove();
        } else if (elementType === CustomElement.LANE) {
          const input = this.editor.element.input.getFromEditorElement(element.id);

          if (input) {
            const { value } = input;

            const {
              x,
              y,
            } = element.position();

            input.remove();

            this.editor.element.create.RectangleLabel({ x, y: y - 32, text: value });

            element.attr('body/textAnchor', 'left');
            element.attr('textAnchor', 'left');
          }
        }
      }

      this.editor.element.moveAllElementsDown(200);
    }
  }

  exportPDF() {
    try {
      this.data.exportingPDF = true;

      this.setToPrint();

      const stageStage = document.getElementsByTagName('body')[0];

      if (stageStage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // window.html2pdf(stageStage, {
        //   jsPDF: {
        //     orientation: 'landscape',
        //     unit: 'px',
        //     format: [
        //       this.editor.data.options.width,
        //       this.editor.data.options.height,
        //     ],
        //   },
        // });
      }
    } finally {
      setTimeout(() => {
        this.data.exportingPDF = false;
      }, 2000);
    }
  }
}

export default Graph;
