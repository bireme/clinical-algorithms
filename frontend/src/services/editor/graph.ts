import { reactive } from 'vue';
import { api } from 'boot/axios';
import html2canvas from 'html2canvas';
import { jsPDF as JsPdf } from 'jspdf';

import Editor from 'src/services/editor/index';

import { CustomElement } from 'src/services/editor/elements/custom-elements';
import { GRAPH_MODE_PRINT, GRAPH_MODE_PUBLIC } from 'src/services/editor/types';

const RESOURCE_ALGORITHM = 'algorithms';
const RESOURCE = 'algorithms/graph';

export interface IEditorData {
  mode: string,
  scale: number,
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
    scale: 1,
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
      const { data }: {
        data: {
          id: number,
          algorithm_id: number,
          graph: string,
          user_id: number,
          updated_at: string,
        }
      } = await api.get(`${RESOURCE}/${graphId}`);

      this.data.graph.id = data.id;
      this.data.graph.algorithm_id = data.algorithm_id;
      this.data.graph.user_id = data.user_id;
      this.data.graph.updated_at = data.updated_at;

      if (data.graph) {
        // open graph...
        const graphJson = JSON.parse(data.graph);

        if (graphJson) {
          this.editor.data.graph.fromJSON(graphJson);

          setTimeout(() => {
            const allElements = this.editor.data.graph.getElements();

            this.editor.element.input.setValues(allElements);
            this.editor.element.textarea.setValues(allElements);
          }, 500);

          if (!this.editor.data.readOnly) {
            setTimeout(() => {
              const allElementsAgain = this.editor.data.graph.getElements();

              this.editor.element.createElementsTools(allElementsAgain);
              this.editor.element.textarea.createEventHandlers();
            }, 200);
          }

          await this.editor.element.createAllRecommendationsTotals();

          // READ-ONLY MODE
          if (
            this.editor.data.readOnly
            && this.data.mode !== GRAPH_MODE_PRINT
          ) {
            setTimeout(() => {
              this.editor.element.textarea.disableAll();
            }, 600);

            this.editor.element.createRecommendations();

            if (this.editor.route.query.node) {
              setTimeout(() => {
                this.editor.element.select(String(this.editor.route.query.node));

                this.editor.element.centerViewOnSelected();
              }, 1501);
            }
          }
        }
      }

      // reset scroll because of createEventHandlers method
      // that focus on input fields
      // which changes the scroll
      setTimeout(() => {
        Editor.setScroll({
          x: 0,
          y: 0,
        });

        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        document.getElementById('stage-loading-spinner-cover')
          ?.classList
          .add('hidden');
      }, 1500);

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
   * Swap some elements to be exported as PDF correctly
   */
  public async setToPrint(putLogoOnHeader: boolean, scale = 1) {
    this.data.scale = scale;

    await this.editor.init('editor-stage');

    void this.putLogoOnPdfHeader(putLogoOnHeader);

    const allElements = this.editor.element.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        const elementType = element.prop('type');

        if ([
          CustomElement.ACTION,
          CustomElement.EVALUATION,
        ].includes(elementType)) {
          const label = element.prop('props/label');
          const textarea = this.editor.element.textarea.getFromEditorElement(element.id);

          if (textarea) {
            const {
              x,
              y,
            } = element.position();

            textarea.remove();

            this.editor.element.create.PrintLabel({
              x,
              y,
              text: label,
            });
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

            this.editor.element.create.RectangleLabel({
              x,
              y: y - 32,
              text: value,
            });

            element.attr('body/textAnchor', 'left');
            element.attr('textAnchor', 'left');
          }
        }
      }

      this.editor.element.createElementsIndexes();

      await this.editor.element.createRecommendationsForPDF();

      this.editor.element.moveAllElementsDown(250);

      this.cropToContent(400, 200);

      await this.editor.element.create.PDFHeader();

      await this.editor.element.create.PDFFooter();

      this.editor.element.redrawAllConnections();

      this.editor.element.addElementsIndexesToPaper();
    }

    this.setScale();
  }

  public setScale() {
    this.editor.data.paper?.scale(this.data.scale);

    const finalSize = {
      width: (this.data.printSize.width * this.data.scale).toFixed(0),
      height: (this.data.printSize.height * this.data.scale).toFixed(0),
    };

    if (this.editor.paperDiv) {
      this.editor.paperDiv.setAttribute(
        'style',
        `width: ${finalSize.width}px; height: ${finalSize.height}px`,
      );
    }
  }

  public cropToContent(shiftX = 200, shiftY = 200) {
    this.setContentSize(shiftX, shiftY);

    this.editor.data.paper?.setDimensions(this.data.printSize.width, this.data.printSize.height);
  }

  /**
   * Get outermost element coordinate in the graph
   * @private
   */
  public getOutermostCoordinate(coordinate: 'x' | 'y') {
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

      if (
        ![
          CustomElement.PDF_HEADER,
          CustomElement.RECOMMENDATION,
          CustomElement.LINK,
          'link',
          'standard.Rectangle',
          'standard.TextBlock',
        ].includes(elementType)
        && !(
          elementType === CustomElement.RECOMMENDATION_DESCRIPTION
          && coordinate === 'x'
        )
      ) {
        // lanes are not considered to calculate width
        if (elementType !== CustomElement.LANE) {
          const refX = x + width;
          outerX = refX > outerX ? refX : outerX;
        }

        const refY = y + height;
        lowerY = refY > lowerY ? refY : lowerY;
      }
    }

    return coordinate === 'x' ? outerX : lowerY;
  }

  private setContentSize(shiftX: number, shiftY: number) {
    this.data.printSize.width = this.getOutermostCoordinate('x') + shiftX;
    this.data.printSize.height = this.getOutermostCoordinate('y') + shiftY;
  }

  public async exportPDF() {
    try {
      const element = document.querySelector('#editor-stage');

      if (element) {
        const canvas = await html2canvas(<HTMLElement>element, {
          scale: window.devicePixelRatio,
          logging: false,
          backgroundColor: '#FFFFFF',
          // windowWidth: 800,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          letterRendering: true,
          allowTaint: true,
          useCORS: true,
          /* onclone: (document) => {
            const currentElement = document.querySelector('#disc-report-content');

            if (currentElement) {
              currentElement.classList.add('pdf-mode');
            }
          }, */
        });

        const pdf = new JsPdf({
          orientation: this.data.printSize.width > this.data.printSize.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [
            Number((this.data.printSize.width * 0.8).toFixed(0)),
            Number((this.data.printSize.height * 0.8).toFixed(0)),
          ],
        });

        pdf.addImage(
          canvas,
          'PNG',
          10,
          10,
          Number((this.data.printSize.width * 0.8).toFixed(0)),
          Number((this.data.printSize.height * 0.8).toFixed(0)),
          '',
          'FAST',
        );

        pdf.save(`${this.editor.graph.data.algorithm.title} - ${new Date().toString()}.pdf`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default Graph;
