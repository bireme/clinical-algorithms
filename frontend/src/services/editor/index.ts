import * as joint from 'jointjs';
import { dia } from 'jointjs';

import { GRAPH_MODE_PRINT, IJointData } from 'src/services/editor/types';
import { reactive } from 'vue';
import customElements, { CustomElement } from 'src/services/editor/elements/custom-elements';
import Element from 'src/services/editor/element';
import Ports from 'src/services/editor/ports';
import Graph from 'src/services/editor/graph';
import Metadata from 'src/services/editor/metadata';
import { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { ALGORITHMS_PUBLIC_EDITOR } from 'src/router/routes/algorithms';
import { QVueGlobals } from 'quasar';

const graph = new joint.dia.Graph({}, { cellNamespace: customElements });

export const deselectAllTexts = () => {
  window.getSelection()?.removeAllRanges();
};

class Editor {
  paperDiv: HTMLElement | undefined;

  graph: Graph;

  element: Element;

  ports: Ports;

  metadata: Metadata;

  quasar: QVueGlobals;

  route: RouteLocationNormalizedLoaded;

  router: Router;

  data: IJointData = reactive({
    public: false,
    isMaintainer: false,
    readOnly: false,
    showSaveDialog: false,
    options: {
      width: 6000,
      height: 6000,
    },
    paper: undefined,
    graph,
  });

  constructor(
    quasar: QVueGlobals,
    route: RouteLocationNormalizedLoaded,
    router: Router,
  ) {
    this.quasar = quasar;
    this.route = route;
    this.router = router;

    this.element = new Element(this);
    this.ports = new Ports(this);
    this.graph = new Graph(this);
    this.metadata = new Metadata(this);
  }

  public reset() {
    this.graph.data.savingTimeout = null;
    this.graph.notSaved(true);

    this.graph.data.mode = 'public';
    this.data.readOnly = true;

    this.element.data.selectedId = '';

    this.data.showSaveDialog = false;
    this.data.graph.clear();
  }

  public async init(elementId: string) {
    return new Promise((resolve, reject) => {
      try {
        this.paperDiv = document.getElementById(elementId) || undefined;

        const options = {
          el: this.paperDiv,
          model: this.data.graph,
          width: this.data.options.width,
          height: this.data.options.height,

          cellViewNamespace: customElements,
          preventDefaultViewAction: false,

          gridSize: 0,
          drawGrid: false,

          background: { color: '#EAEAEA' },

          linkPinning: false,
          snapLinks: { radius: 5 },

          interactive: () => !this.data.readOnly,

          defaultLink: this.element.create.Link,
        };

        if (this.data.readOnly) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options.drawGrid = false;

          options.gridSize = 0;

          options.background.color = '#FFFFFF';
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options.drawGrid = {
            name: 'mesh',
            args: {
              color: '#D8D8D8',
              thickness: 1,
            },
          };

          options.gridSize = 10;
        }

        this.data.paper = new joint.dia.Paper(options);

        this.data.paper.on('blank:pointerup', (/* elementView */) => {
          this.element.deselectAll();
        });

        this.data.paper.on('blank:pointerdown', () => {
          if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();

            deselectAllTexts();
          }
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.data.graph.on('change:position', (cell: dia.Cell) => {
          this.element.data.wasMoving = true;

          this.graph.notSaved();

          deselectAllTexts();

          const element = this.element.getById(cell.id);

          if (element) {
            this.element.deleteRecommendationsTotals(element);
          }
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.data.graph.on('change:vertices', (/* cell: dia.Cell */) => {
          this.graph.notSaved();
        });

        this.data.paper.on('element:mouseover', (elementView) => {
          if (!this.data.readOnly) {
            this.element.showPorts(elementView.options.model.id);
          }

          if (elementView.options.model.prop('type') === CustomElement.RECOMMENDATION_TOTAL) {
            // avoid interacting with RECOMMENDATION_TOTAL elements
            this.data.paper?.setInteractivity(false);
          }
        });

        this.data.paper.on('element:mouseout', (elementView) => {
          if (!this.data.readOnly) {
            this.element.hidePorts(elementView.options.model.id);
          }

          if (elementView.options.model.prop('type') === CustomElement.RECOMMENDATION_TOTAL) {
            // avoid interacting with RECOMMENDATION_TOTAL elements
            this.data.paper?.setInteractivity(true);
          }
        });

        this.data.paper.on('element:mouseleave', (elementView) => {
          this.element.hidePorts(elementView.options.model.id);
        });

        this.data.paper.on('element:pointerdown', (/* elementView: dia.ElementView */) => {
          this.element.deselectAll();
        });

        this.data.paper.on('element:pointerup', (elementView: dia.ElementView) => {
          if (elementView.options.model.prop('type') === CustomElement.RECOMMENDATION_TOGGLER) {
            this.element.toggleRecommendation(elementView.options.model.id);
          } else if (
            // not in print mode (PDF export)
            this.graph.data.mode !== GRAPH_MODE_PRINT
            // do not select [lane, recommendation_toggler] element if it's in read only mode
            && !(
              this.data.readOnly
              && elementView.options.model.prop('type') === CustomElement.LANE
            )
            // cannot interact with RECOMMENDATION_TOTAL elements at all
            && elementView.options.model.prop('type') !== CustomElement.RECOMMENDATION_TOTAL
          ) {
            this.element.select(elementView.options.model.id);
          }

          // redraw recommendations totals after stop moving
          if (this.element.data.wasMoving) {
            this.element.updateRecommendationsTotals();

            this.element.data.wasMoving = false;

            this.element.redrawAllConnections();
          }
        });

        this.data.paper.on('link:snap:connect', () => {
          this.element.deselectAll();

          deselectAllTexts();
        });

        this.data.paper.on('link:connect', (linkView) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.element.hidePorts(linkView.model.attributes.source.id);

          this.element.deselectAll();

          this.graph.notSaved();
        });

        this.data.paper.on('link:disconnect', () => {
          this.element.deselectAll();

          this.graph.notSaved();
        });

        this.data.paper.on('link:mouseover', (linkView) => {
          if (this.data.readOnly) {
            Element.removeLinkTools(linkView);
          }
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  // private static createLink() {
  //   return new customElements.LinkElement();
  // }

  public toggleSaveDialog() {
    this.data.showSaveDialog = !this.data.showSaveDialog;
  }

  public setReadOnly(readOnly: boolean) {
    this.data.readOnly = readOnly;
  }

  public async switchToMode() {
    await this.router.replace({
      name: ALGORITHMS_PUBLIC_EDITOR,
      query: {
        id: this.route.query.id,
        mode: this.route.query.mode === 'edit' ? 'public' : 'edit',
        previewOrigin: 'admin',
        node: this.route.query.node || undefined,
        search: this.route.query.search || undefined,
      },
    });

    setTimeout(() => window.location.reload(), 50);
  }

  static setScroll(params: { x?: number, y?: number }) {
    const stageWrapper = document.getElementById('editor-stage-wrapper');

    if (stageWrapper) {
      if (params.x !== undefined) {
        stageWrapper.scrollLeft = params.x;
      }

      if (params.y !== undefined) {
        stageWrapper.scrollTop = params.y;
      }
    }
  }

  public setIsMaintainer(value: boolean) {
    this.data.isMaintainer = value;
  }

  public keyPress = (eventObject: KeyboardEvent) => {
    if (
      eventObject.keyCode === 68
      && eventObject.ctrlKey
    ) {
      if (!this.data.readOnly) {
        this.element.clone();
      }

      eventObject.preventDefault();
    }
  };

  static preview(id: number, extra = '') {
    window.open(`editor?id=${id}&preview=1&mode=public${extra}`);
  }
}

export default Editor;
