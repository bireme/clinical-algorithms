import { reactive } from 'vue';
import { api } from 'boot/axios';
import html2pdf from 'html2pdf.js';

import Editor from 'src/services/editor/index';

import { CustomElement } from 'src/services/editor/elements/custom-elements';
import { GRAPH_MODE_PUBLIC } from "src/services/editor/types";

const RESOURCE_ALGORITHM = 'algorithms';
const RESOURCE = 'algorithms/graph';

export interface IEditorData {
  mode: string,
  graph: {
    id: number,
    algorithm_id: number,
    user_id: number,
    updated_at: string,
  },
  algorithm: {
    id: number,
    user_id: number,
    title: string,
    description: string,
    version: string,
    updated_at: string,
  },
  loading: boolean,
  saving: boolean,
  saved: boolean | null,
  savingTimeout: ReturnType<typeof setTimeout> | null,
  printSize: {
    width: number,
    height: number,
  },
  logoOnHeader: boolean,
}

class Graph {
  editor: Editor;

  data: IEditorData = reactive({
    mode: '',
    graph: {
      id: 0,
      algorithm_id: 0,
      user_id: 0,
      updated_at: '',
    },
    algorithm: {
      id: 0,
      user_id: 0,
      title: '',
      description: '',
      version: '',
      updated_at: '',
    },
    loading: false,
    saving: false,
    saved: null,
    savingTimeout: null,
    printSize: {
      width: 0,
      height: 0,
    },
    logoOnHeader: false,
  });

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public setMode(mode: string) {
    this.data.mode = mode || GRAPH_MODE_PUBLIC;
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
          user_id: number,
          updated_at: string,
      } } = await api.get(`${RESOURCE}/${graphId}`);

      this.data.graph.id = data.id;
      this.data.graph.algorithm_id = data.algorithm_id;
      this.data.graph.user_id = data.user_id;
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

  public async setAlgorithm() {
    try {
      const { data } = await api.get(`${RESOURCE_ALGORITHM}/${this.data.graph.algorithm_id}`);

      this.data.algorithm = { ...data };

      this.editor.data.public = !!data.public;

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
        public: this.editor.data.public,
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

  public putLogoOnPdfHeader(value: boolean) {
    this.data.logoOnHeader = value;
  }

  /**
   * Swap some elements in order to be exported as PDF correctly
   */
  public async setToPrint() {
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

      this.cropToContent();

      await this.editor.element.create.PDFHeader();

      await this.editor.element.create.PDFFooter();
    }
  }

  private cropToContent() {
    this.setContentSize();

    this.editor.data.paper?.setDimensions(this.data.printSize.width, this.data.printSize.height);
  }

  private setContentSize() {
    let outerX = 0;
    let lowerY = 0;

    const allCells = this.editor.data.graph.getCells();

    for (const cell of allCells) {
      const {
        width,
        height,
        x,
        y,
      } = cell.getBBox();

      const elementType = cell.prop('type');

      if (![
        CustomElement.PDF_HEADER,
        CustomElement.RECOMMENDATION,
        CustomElement.LINK,
        'link',
        'standard.Rectangle',
        'standard.TextBlock',
      ].includes(elementType)) {
        // lanes are not considered to calculate width
        if (elementType !== CustomElement.LANE) {
          const refX = x + width;
          outerX = refX > outerX ? refX : outerX;
        }

        const refY = y + height;
        lowerY = refY > lowerY ? refY : lowerY;
      }
    }

    this.data.printSize.width = outerX + 200;
    this.data.printSize.height = lowerY + 200;
  }

  public exportPDF() {
    try {
      const stageStage = document.getElementById('editor-stage');

      if (stageStage) {
        const options = {
          filename: `${this.editor.graph.data.algorithm.title}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          jsPDF: {
            orientation: this.data.printSize.width > this.data.printSize.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [this.data.printSize.width, this.data.printSize.height],
          },
        };

        html2pdf(stageStage, options);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default Graph;
