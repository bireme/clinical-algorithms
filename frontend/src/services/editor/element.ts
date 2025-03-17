import * as joint from 'jointjs';
import { dia } from 'jointjs';

import Editor, { deselectAllTexts } from 'src/services/editor/index';
import Ports from 'src/services/editor/ports';

import customElements, {
  CustomElement,
  elementName,
  RecommendationTotalConstructor,
  TEXTAREA_CLASSNAME,
} from 'src/services/editor/elements/custom-elements';

import { reactive } from 'vue';

import { autoResizeTextarea } from 'src/services/editor/textarea';
import icons from 'src/services/editor/elements/svg_icons';

import {
  getRecommendationTypeLabel,
  FORMAL_RECOMMENDATION,
  GOOD_PRACTICES,
  INFORMAL_RECOMMENDATION,
  RECOMMENDATION_TYPES,
} from 'src/services/editor/constants/metadata/recommendation_type';

import { formatDatetime } from 'src/services/date';
import { toDataUrl } from 'src/services/images';
import { getElementBoundingRect, randomString } from 'src/services/general';
import Users from 'src/services/users';

import {
  RecommendationDescriptionConstructor,
  RecommendationDescriptionHeaderConstructor,
} from 'src/services/editor/elements/recommendation-element';

import { orderRecommendations } from 'src/services/recommendations';
import { CERTAINTY } from 'src/services/editor/constants/metadata/certainty';
import { IFixedMetadata } from 'src/services/editor/constants/metadata';
import { COLOR_ACCENT } from 'src/services/colors';

class Element {
  editor: Editor;

  data: {
    selectedId: dia.Cell.ID,
    elementToCreate: string,
    creationPosition: {
      x: number,
      y: number,
    },
    recommendationsRelationsMap: { [key: dia.Cell.ID]: dia.Cell.ID },
    recommendationsTogglerRelationsMap: { [key: dia.Cell.ID]: dia.Cell.ID },
    wasMoving: boolean,
  } = reactive({
      selectedId: '',
      elementToCreate: '',
      creationPosition: {
        x: 0,
        y: 0,
      },
      recommendationsRelationsMap: {},
      recommendationsTogglerRelationsMap: {},
      wasMoving: false,
    });

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public getAll() {
    return this.editor.data.graph.getElements();
  }

  public isAction(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.ACTION;

    return this.getSelected()
      ?.prop('type') === CustomElement.ACTION;
  }

  public isEvaluation(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.EVALUATION;

    return this.getSelected()
      ?.prop('type') === CustomElement.EVALUATION;
  }

  public isLane(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.LANE;

    return this.getSelected()
      ?.prop('type') === CustomElement.LANE;
  }

  public setCreationPosition(x: number, y: number) {
    const stageWrapper = document.getElementById('editor-stage-wrapper');

    if (stageWrapper) {
      const xWithScroll = x + stageWrapper.scrollLeft;
      const yWithScroll = y + stageWrapper.scrollTop;

      const stringX = String(xWithScroll);
      const stringY = String(yWithScroll);

      // ...respecting 10px paper grid
      const fixedX = xWithScroll - Number(stringX[stringX.length - 1]);
      const fixedY = yWithScroll - Number(stringY[stringY.length - 1]);

      this.data.creationPosition = {
        x: fixedX,
        y: fixedY,
      };
    }
  }

  private removeSelected() {
    this.deleteRecommendationsTotals();

    this.getSelected()?.remove();

    this.deselectAll();

    this.redrawAllConnections();

    this.editor.graph.notSaved();
  }

  private customRemoveButton(x = -10, y = -10) {
    return new joint.elementTools.Button({
      focusOpacity: 0.5,
      // x,
      // y,
      offset: {
        x,
        y,
      },
      action: () => {
        this.removeSelected();
      },
      markup: [{
        tagName: 'circle',
        selector: 'button',
        attributes: {
          r: 10,
          fill: 'red',
          cursor: 'pointer',
        },
      }, {
        tagName: 'path',
        selector: 'icon',
        attributes: {
          d: 'M 6.1 -3.972 L 4.972 -5.1 L 0.5 -0.628 L -3.972 -5.1 L -5.1 -3.972 L -0.628 0.5 L -5.1 4.972 L -3.972 6.1 L 0.5 1.628 L 4.972 6.1 L 6.1 4.972 L 1.628 0.5 L 6.1 -3.972 z',
          fill: 'white',
          cursor: 'pointer',
          stroke: 'white',
          strokeWidth: 5,
        },
      }],
    });
  }

  public createElementsTools(elements: dia.Element[]) {
    elements.forEach((element) => {
      if (element.prop('type') === CustomElement.LANE) {
        this.createTools(element, {
          removeButtons: {
            x: 20,
            y: 17,
          },
        });
      } else if (element.prop('type') !== 'standard.Link') {
        this.createTools(element);
      }
    });
  }

  private hideAllRecommendationElements(modelId: string) {
    const recommendationElements = document.getElementsByClassName('joint-type-recommendationelement');
    const recommendationTogglerElements = document.getElementsByClassName('joint-type-recommendationtogglerelement');

    if (recommendationElements.length) {
      for (const recommendationElement of recommendationElements) {
        if (String(this.data.recommendationsTogglerRelationsMap[modelId]) !== recommendationElement.getAttribute('model-id')) {
          recommendationElement.setAttribute('display', 'none');
        }
      }
    }

    if (recommendationTogglerElements.length) {
      for (const recommendationTogglerElement of recommendationTogglerElements) {
        if (modelId !== recommendationTogglerElement.getAttribute('model-id')) {
          const id = recommendationTogglerElement.getAttribute('model-id') as string;

          const currentTogglerElement = this.getById(id);

          if (currentTogglerElement) {
            currentTogglerElement.attr('icon/d', icons.plus);
          }
        }
      }
    }
  }

  public toggleRecommendation(togglerButtonId: string) {
    const togglerButton = this.getById(togglerButtonId);

    if (togglerButton) {
      let recommendationElementId = this.data.recommendationsTogglerRelationsMap[togglerButtonId];

      let domElement = document.querySelector(`[model-id="${recommendationElementId}"]`);

      if (domElement) {
        this.hideAllRecommendationElements(togglerButtonId);

        if (domElement.getAttribute('display')) { // SHOW
          domElement.removeAttribute('display');

          togglerButton.attr('icon/d', icons.minus);

          const recommendationElement = this.getById(recommendationElementId);

          if (recommendationElement) {
            Element.resizeRecommendationElement(recommendationElement);

            // ALERT: needs to remove the attribute "display" again after resizing object...
            recommendationElementId = this.data.recommendationsTogglerRelationsMap[togglerButtonId];

            domElement = document.querySelector(`[model-id="${recommendationElementId}"]`);

            if (domElement) {
              if (domElement.getAttribute('display')) { // SHOW
                domElement.removeAttribute('display');

                togglerButton.attr('icon/d', icons.minus);
              }
            }
          }
        } else { // HIDE
          domElement.setAttribute('display', 'none');

          togglerButton.attr('icon/d', icons.plus);
        }
      }
    }
  }

  private static createBoundaryTool() {
    return new joint.elementTools.Boundary({
      padding: 10,
      rotate: true,
      useModelGeometry: true,
    });
  }

  static getExpandRecommendationButtonPosition(element: dia.Element) {
    const type = element.prop('type');

    const {
      width,
      height,
    } = element.size();

    if (type === CustomElement.ACTION) {
      return {
        x: width + 28,
        y: height - 2,
      };
    }

    return {
      x: width + 25,
      y: height,
    };
  }

  private createTools(element: dia.Element, params?: { removeButtons: { x: number, y: number } }) {
    const allTools: (joint.elementTools.Button | joint.elementTools.Boundary)[] = [];

    // tools for edit mode
    if (!this.editor.data.readOnly) {
      allTools.push(Element.createBoundaryTool());

      const removeButton = this.customRemoveButton(
        params?.removeButtons.x,
        params?.removeButtons.y,
      );

      allTools.push(removeButton);
    }

    const toolsView = new joint.dia.ToolsView({
      tools: [...allTools],
    });

    if (this.editor.data.paper instanceof dia.Paper) {
      const elementView = element.findView(this.editor.data.paper);

      elementView.addTools(toolsView);

      elementView.hideTools();
    }
  }

  public async createElement(event: DragEvent) {
    // prevent default action (open as link for some elements)
    event.preventDefault();

    switch (this.data.elementToCreate) {
      case CustomElement.START:
        this.setCreationPosition(event.x - 24, event.y - 135);
        await this.create.Start();
        break;
      case CustomElement.ACTION:
        this.setCreationPosition(event.x - 100, event.y - 150);
        await this.create.Action();
        break;
      case CustomElement.EVALUATION:
        this.setCreationPosition(event.x - 100, event.y - 150);
        await this.create.Evaluation();
        break;
      case CustomElement.END:
        this.setCreationPosition(event.x - 24, event.y - 135);
        await this.create.End();
        break;
      case CustomElement.LANE:
        this.setCreationPosition(event.x - 24, event.y - 135);
        await this.create.Lane();
        break;
      default:
        await this.create.Start();
    }

    this.editor.element.redrawAllConnections();

    this.editor.graph.notSaved();
  }

  get create() {
    return {
      Start: async () => {
        const element = new customElements.StartElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
          ports: Ports.generateToStart(),
        }).resize(40, 40)
          .addTo(this.editor.data.graph);

        this.createTools(element);

        // deselectAllTexts();
      },
      Action: async () => {
        const element = new customElements.ActionElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
          ports: Ports.generateActionPorts(),
        });

        element.resize(200, 100);

        element.addPorts([
          // { group: 'in', attrs: { label: { text: 'in1' } } },
          { group: 'in' },
          { group: 'out' },
          { group: 'top' },
          { group: 'top' },
          { group: 'top' },
          { group: 'bottom' },
          { group: 'bottom' },
          { group: 'bottom' },
        ]);

        element.addTo(this.editor.data.graph);

        this.createTools(element);

        this.textarea.createEventHandlers();

        // deselectAllTexts();
      },
      Evaluation: async () => {
        const element = new customElements.EvaluationElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
          ports: Ports.generateActionPorts(),
        });

        element.resize(200, 100);

        element.addPorts([
          { group: 'in' },
          { group: 'out' },
          { group: 'top' },
          { group: 'top' },
          { group: 'top' },
          { group: 'bottom' },
          { group: 'bottom' },
          { group: 'bottom' },
        ]);

        element.addTo(this.editor.data.graph);

        this.createTools(element);

        this.textarea.createEventHandlers();

        // deselectAllTexts();
      },
      End: async () => {
        const element = new customElements.EndElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
        }).resize(40, 40)
          .addTo(this.editor.data.graph);

        this.createTools(element);

        // deselectAllTexts();
      },
      RecommendationTogglerButton: (
        originalElement: dia.Element,
        recommendationElement: dia.Element,
      ) => {
        const {
          width,
          height,
        } = originalElement.size();
        const {
          x,
          y,
        } = originalElement.position();

        const togglerElement = new customElements.RecommendationTogglerElement({
          position: {
            x: x + width + 21,
            y: y + height - 10,
          },
        }).addTo(this.editor.data.graph);

        this.data.recommendationsTogglerRelationsMap[togglerElement.id] = recommendationElement.id;
      },
      Recommendation: async (x: number, y: number, originalElement: dia.Element) => {
        const metadata = this.editor.metadata.getFromElement(originalElement);

        if (metadata && metadata.fixed) {
          const divId = randomString(32);

          const RecommendationElement = customElements.RecommendationElement(metadata.fixed, divId);

          const recommendationElement = new RecommendationElement({
            position: {
              x,
              y,
            },
          }).resize(600, 500 * metadata.fixed.length);

          this.create.RecommendationTogglerButton(originalElement, recommendationElement);

          recommendationElement.attr('./display', 'none');

          setTimeout(() => {
            recommendationElement.addTo(this.editor.data.graph);

            // create click event handlers for each recommendation
            this.create.RecommendationEventHandlers(
              recommendationElement.id,
              originalElement.id,
            );
          }, 100);
        }
      },
      RecommendationEventHandlers: (
        recommendationElementId: dia.Cell.ID,
        originalElementId: dia.Cell.ID,
      ) => {
        // create the ID relations between original element (that contains recommendations)
        // and the element with recommendations list
        // (used for toggle button)
        this.data.recommendationsRelationsMap[originalElementId] = recommendationElementId;

        const domElement = document.querySelector(`[model-id="${recommendationElementId}"]`);

        if (domElement) {
          const listItems = domElement?.getElementsByClassName('row');

          if (listItems.length) {
            for (const listItem of listItems) {
              listItem.addEventListener('click', () => {
                this.editor.metadata.showRecommendation(
                  originalElementId,
                  Number(listItem.getAttribute('data-index')),
                );
              });
            }
          }
        }
      },
      Lane: async () => {
        const element = new customElements.LaneElement({
          position: {
            x: 0,
            y: this.data.creationPosition.y,
          },
        }).resize(this.editor.data.options.width, 50)
          .addTo(this.editor.data.graph);

        this.createTools(element, {
          removeButtons: {
            x: 20,
            y: 17,
          },
        });

        this.textarea.createEventHandlers();

        // deselectAllTexts();
      },
      RecommendationTotal: async (
        element: dia.Element,
        type: string,
        totalRecommendations: number,
        refY: number,
      ) => {
        const hasPendency = this.editor.metadata.hasTypePendency(element, type);

        if (hasPendency) this.editor.metadata.createPendency();

        const recommendationAbbreviation = {
          [FORMAL_RECOMMENDATION]: 'RF',
          [INFORMAL_RECOMMENDATION]: 'RI',
          [GOOD_PRACTICES]: 'BP',
        };

        const {
          x,
          y,
        } = element.position();

        const { width } = element.size();

        const RTEConstructor = RecommendationTotalConstructor(hasPendency);

        const createElement = new RTEConstructor({
          position: {
            x: x + width + 9,
            y: y + refY,
          },
        }).resize(28, 17)
          .addTo(this.editor.data.graph);

        createElement.prop('props/parentElement', element.id);

        createElement.attr(
          'label/text',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          `${totalRecommendations}${recommendationAbbreviation[type]}`,
        );
      },
      PrintLabel: (options: {
        x: number,
        y: number,
        text: string,
      }) => {
        const textBlock = new joint.shapes.standard.TextBlock();
        textBlock.resize(170, 94);
        textBlock.position(options.x + 15, options.y);
        textBlock.attr('body/class', 'myTextBlock');
        textBlock.attr('body/stroke', '');
        textBlock.attr('body/strokeWidth', '0');
        textBlock.attr('body/fill', 'transparent');
        textBlock.attr('label/text', options.text);

        textBlock.addTo(this.editor.data.graph);
      },
      RectangleLabel: (options: {
        x: number,
        y: number,
        text: string,
      }) => {
        const textBlock = new joint.shapes.standard.Rectangle();

        textBlock.resize(1000, 94);
        textBlock.position(options.x + 16, options.y);
        textBlock.attr('body/class', 'myTextBlock');
        textBlock.attr('body/stroke', '');
        textBlock.attr('body/strokeWidth', '0');
        textBlock.attr('body/fill', 'transparent');
        textBlock.attr('label/text', options.text);
        textBlock.attr('label/text-anchor', 'left');
        textBlock.attr('label/ref-x', -480);

        textBlock.attr('label/style', 'font-size: 24px; border: 1px solid #F00');

        textBlock.addTo(this.editor.data.graph);
      },
      PDFHeader: async () => {
        const users = new Users();

        await users.get();

        const urlBase64 = await toDataUrl('/imgs/logo-ops.png');

        const defaults = {
          attrs: {
            body: {
              width: 'calc(w)',
              height: 'calc(h)',
              fill: '#F4F4F6',
              strokeWidth: 0,
            },
            title: {
              style: 'font-size: 32px; font-weight: bold',
              refX: 30,
              refY: 35,
            },
            description: {
              style: 'font-size: 18px',
              refX: 30,
              refY: 90,
            },
            author: {
              style: 'font-size: 16px',
              refX: 30,
              refY: 132,
            },
            logo: {
              'xlink:href': '',
              refX: this.editor.graph.data.printSize.width - 320,
              refY: 30,
            },
          },
        };

        const markup = {
          markup: [{
            tagName: 'rect',
            selector: 'body',
          }, {
            tagName: 'text',
            selector: 'title',
          }, {
            tagName: 'text',
            selector: 'description',
          }, {
            tagName: 'text',
            selector: 'author',
          }, {
            tagName: 'image',
            selector: 'logo',
          }],
        };

        if (this.editor.graph.data.logoOnHeader) {
          defaults.attrs.logo['xlink:href'] = urlBase64;
        }

        const PDFHeaderConstructor = joint.dia.Element.define(
          CustomElement.PDF_HEADER,
          defaults,
          markup,
        );

        const PDFHeader = new PDFHeaderConstructor();

        PDFHeader.resize(this.editor.graph.data.printSize.width, 185);

        const {
          title,
          description,
          user_id: userId,
          updated_at: updatedAt,
        } = this.editor.graph.data.algorithm;

        PDFHeader.attr('title/text', title);
        PDFHeader.attr('description/text', description);
        PDFHeader.attr('author/text', `Autor: ${users.getUserName(userId)} - Última actualización: ${formatDatetime(updatedAt)}`);

        PDFHeader.addTo(this.editor.data.graph);
      },
      PDFFooter: async () => {
        const urlBase64 = await toDataUrl('/imgs/powered_by_bireme.png');

        const PDFFooterConstructor = joint.dia.Element.define(CustomElement.PDF_FOOTER, {
          attrs: {
            body: {
              width: 'calc(w)',
              height: 'calc(h)',
              fill: 'white',
              strokeWidth: 0,
            },
            description: {
              refX: 30,
              refY: 90,
              style: 'font-size: 10pt; text-align: left;',
            },
            logo: {
              'xlink:href': urlBase64,
              refX: this.editor.graph.data.printSize.width - 260,
              refY: 105,
            },
          },
        }, {
          markup: [{
            tagName: 'rect',
            selector: 'body',
          }, {
            tagName: 'text',
            selector: 'description',
          }, {
            tagName: 'image',
            selector: 'logo',
          }],
        });

        const PDFFooter = new PDFFooterConstructor();

        PDFFooter.resize(this.editor.graph.data.printSize.width, 200);
        PDFFooter.position(0, this.editor.graph.data.printSize.height - 200);

        PDFFooter.attr(
          'description/text',
          `La herramienta de producción de algoritmos clínicos basados en evidencias ha sido desarrollada por la OPS para facilitar la traducción\n
de recomendaciones basadas en evidencias en acciones de salud. El contenido incluido en los algoritmos es responsabilidad técnica de los\n
autores individuales, y la producción de algoritmos con esta herramienta no implica respaldo o acuerdo por parte de la OPS con su contenido.`,
        );

        PDFFooter.addTo(this.editor.data.graph);
      },
      Link: () => {
        const link = new dia.Link({
          attrs: {
            '.marker-target': {
              d: 'M 10 0 L 0 5 L 10 10 z',
            },
            line: {
              stroke: '#333333',
              strokeWidth: 5,
            },
          },
        });

        link.router('manhattan', {
          step: 10,
          padding: 40,
          excludeTypes: ['standard.Rectangle'],
          excludeEnds: ['source'],
        });

        link.connector('straight', {
          cornerType: 'cubic',
          precision: 0,
          cornerRadius: 10,
        });

        return link;
      },
    };
  }

  static resizeRecommendationElement(recommendationElement: dia.Element) {
    const recommendationDomElement = document.querySelector(`[model-id="${recommendationElement.id}"]`);

    if (recommendationDomElement) {
      const recommendationElementContents = recommendationDomElement.getElementsByClassName('recommendation-element');

      if (recommendationElementContents.length) {
        const currentElement = document.getElementById(recommendationElementContents[0].id);

        if (currentElement) {
          const { height } = currentElement.getBoundingClientRect();

          recommendationElement.resize(600, height);
        }
      }
    }
  }

  public deselectAll() {
    const elements = this.editor.data.graph.getElements();

    // remove stroke from the selected element
    elements.forEach((element) => {
      // hide element tools
      if (
        this.editor.data.paper
        && !this.editor.data.readOnly
      ) {
        element.findView(this.editor.data.paper).hideTools();
      } else if (this.editor.data.readOnly) {
        // this.createReadonlyTools(element, false);
      }
    });

    this.editor.element.data.selectedId = '';
  }

  public async setProp(
    propName: string,
    value: boolean | string | number | object | undefined | null,
  ) {
    this.getSelected()
      ?.prop(`props/${propName}`, value);

    // avoid "setNotSavedChanges" without changing anything
    // if (commitChanges) {
    //   await this.joint.setNotSavedChanges(true);
    // }
  }

  public async setAttr(attrName: string, value: string) {
    this.getSelected()
      ?.attr(attrName, value);

    // await this.joint.setNotSavedChanges(true);
  }

  public getById(id: dia.Cell.ID): dia.Element | undefined {
    return this.editor.data.graph.getElements()
      .find((element) => element.id === id);
  }

  private createReadonlyTools(element: dia.Element, showBoundary: boolean) {
    if (this.editor.data.paper) {
      const allTools: (joint.elementTools.Button | joint.elementTools.Boundary)[] = [];

      const elementView = element.findView(this.editor.data.paper);

      if (showBoundary) {
        allTools.push(Element.createBoundaryTool());
      }

      const metadata = this.editor.metadata.getFromElement(element);

      if (metadata?.fixed && metadata.fixed.length) {
        // this.createExpandRecommendationsButton(
        //   allTools,
        //   { ...Element.getExpandRecommendationButtonPosition(element) },
        //   showBoundary ? 2 : 1,
        // );
      }

      const toolsView = new joint.dia.ToolsView({
        tools: [...allTools],
      });

      elementView.addTools(toolsView);
    }
  }

  public select(elementId: dia.Cell.ID) {
    // this.deselectAll();

    const element = this.getById(elementId);

    if (element && this.editor.data.paper) {
      const elementView = element.findView(this.editor.data.paper);

      if (elementView) {
        elementView.showTools();

        this.data.selectedId = elementId;

        if (element) {
          const elementType = element.prop('type');

          if (elementType === CustomElement.LANE) {
            const { y } = element.position();

            element.position(0, y);

            if (document.activeElement?.tagName !== 'INPUT') {
              deselectAllTexts();
            }
          }

          if (
            this.editor.data.readOnly
            && ![
              CustomElement.RECOMMENDATION,
              CustomElement.RECOMMENDATION_TOTAL,
              CustomElement.START,
              CustomElement.END,
            ].includes(elementType)
          ) {
            // this.createReadonlyTools(element, true);
          }
        }
      }
    }
  }

  public getSelected() {
    const elements = this.editor.data.graph.getElements();

    return elements.find(({ id }) => this.data.selectedId === id);
  }

  public getLabel(element?: dia.Element) {
    if (element) return element.prop('props/label') || '';

    return this.getSelected()
      ?.prop('props/label') || '';
  }

  public getTitle() {
    return this.getSelected()
      ?.prop('title') || '';
  }

  // PROBABLY DEPRECATED
  // public async setTitle(title: string) {
  //   await this.setProp('title', title);
  //
  //   await this.setAttr('label/text', title);
  // }

  public getName() {
    const elementType = this.getSelected()
      ?.prop('type');

    if (elementType) return elementName[elementType];

    return '';
  }

  get input() {
    return {
      setValues: (elements: dia.Element[]) => {
        elements.forEach((element) => {
          if (this.isLane(element)) {
            const textarea = this.input.getFromEditorElement(element.id);

            if (textarea) {
              textarea.value = element.prop('props/label') || '';
            }
          }

          setTimeout(() => {
            deselectAllTexts();
          }, 1);
        });
      },
      getFromEditorElement(elementId: dia.Cell.ID) {
        const domElement = document.querySelector(`[model-id="${elementId}"]`);

        return domElement?.getElementsByTagName('input')[0];
      },
    };
  }

  get textarea() {
    return {
      getFromEditorElement(elementId: dia.Cell.ID) {
        const domElement = document.querySelector(`[model-id="${elementId}"]`);

        return domElement?.getElementsByTagName('textarea')[0] as HTMLTextAreaElement | undefined;
      },
      value: () => {
        const selectedElement = this.getSelected();

        if (selectedElement) {
          // this.textarea.
        }
      },
      setValues: (elements: dia.Element[]) => {
        elements.forEach((element) => {
          if (
            this.isAction(element)
            || this.isEvaluation(element)
            // || this.isLane(element)
          ) {
            const textarea = this.textarea.getFromEditorElement(element.id);

            if (textarea) {
              textarea.value = element.prop('props/label') || '';

              // force resizing textarea...
              autoResizeTextarea(textarea);
            }

            setTimeout(() => {
              deselectAllTexts();
            }, 50);
          }
        });
      },
      getEditorElement: (input: HTMLElement) => {
        const father = input.parentElement;
        const grandfather = father?.parentElement;
        const grandGrandfather = grandfather?.parentElement;
        const element = grandGrandfather?.parentElement;

        if (element) {
          const elementId = element?.getAttribute('model-id');

          if (elementId) return this.getById(elementId);
        }

        return undefined;
      },
      createEventHandlers: () => {
        const inputs = document.getElementsByClassName(TEXTAREA_CLASSNAME);

        if (inputs.length) {
          // eslint-disable-next-line no-restricted-syntax
          for (const input of inputs) {
            if (input instanceof HTMLTextAreaElement) {
              autoResizeTextarea(input);
            }

            input.addEventListener('input', (event) => {
              const element = this.textarea.getEditorElement(event.target as HTMLElement);

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              element?.prop('props/label', event.target?.value);

              this.editor.graph.notSaved();
            });
          }
        }
      },
      disableAll() {
        const inputs = document.getElementsByClassName(TEXTAREA_CLASSNAME);

        if (inputs.length) {
          // eslint-disable-next-line no-restricted-syntax
          for (const input of inputs) {
            input.setAttribute('readonly', 'true');
            input.classList.add('cursor-inherit');
          }
        }
      },
      focus: () => {
        const selectedElement = this.getSelected();

        if (selectedElement) {
          const textarea = this.textarea.getFromEditorElement(selectedElement.id);

          if (textarea) {
            textarea.focus();
          }
        }
      },
    };
  }

  public createRecommendations() {
    const allElements = this.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        if (element.prop('type') === CustomElement.ACTION) {
          const {
            x,
            y,
          } = element.position();

          void this.create.Recommendation(x, y + 106, element);
        } else if (element.prop('type') === CustomElement.EVALUATION) {
          const {
            x,
            y,
          } = element.position();

          void this.create.Recommendation(x + 1, y + 111, element);
        }
      }
    }
  }

  static createRecommendationLinks(
    RecommendationElement: dia.Element,
    shift: { label: number, links: number },
    recommendation: IFixedMetadata,
    linkLinksClass: string,
    elementWidth: number,
  ) {
    const llRefY = RecommendationElement.attr('links_label/refY');
    // RecommendationElement.attr('links_label/refY', llRefY + lastElementBeforeLinks.height + 370);
    // RecommendationElement.attr('links_links/refY', llRefY + lastElementBeforeLinks.height + 400);
    RecommendationElement.attr('links_label/refY', llRefY + shift.label);
    RecommendationElement.attr('links_links/refY', llRefY + shift.links);

    let linksContent = '';
    let linkIndex = 0;

    for (const link of recommendation.links) {
      if (linkIndex > 0) linksContent += '\n\n';
      linksContent += `${link.type}: ${link.url}`;
      linkIndex += 1;
    }

    RecommendationElement.attr('links_links/text', linksContent);

    const linksLinksRect = getElementBoundingRect(linkLinksClass);

    if (linksLinksRect) {
      const newElementHeight = Number((
        linksLinksRect.top - RecommendationElement.position().y
      ).toFixed(0)) + (linksLinksRect.height + 18);

      RecommendationElement.size(elementWidth, newElementHeight);

      return newElementHeight;
    }

    return 0;
  }

  static isActionOrEvaluation(element: dia.Element) {
    const elementType = element.prop('type');

    return [CustomElement.ACTION, CustomElement.EVALUATION].includes(elementType);
  }

  static readjustRecommendationElementHeight(
    RecommendationElement: dia.Element,
    elementTextClass: string,
    elementWidth: number,
  ) {
    let elementHeight = 0;

    const TextBoundingRect = getElementBoundingRect(elementTextClass);

    if (TextBoundingRect) {
      elementHeight = Number((
        TextBoundingRect.top - RecommendationElement.position().y
      ).toFixed(0)) + (TextBoundingRect.height + 20);

      RecommendationElement.size(elementWidth, elementHeight);

      return elementHeight;
    }

    return 0;
  }

  public async createRecommendationsForPDF() {
    const elementWidth = this.editor.graph.getOutermostCoordinate('x') + 130;
    let elementHeight = 1000;
    let outermostY = this.editor.graph.getOutermostCoordinate('y') + 50;

    const allElements = this.getAll();

    if (allElements.length) {
      for await (const element of allElements) {
        const recommendationGroupIndex = element.prop('props/elementIndex');

        if (recommendationGroupIndex && Element.isActionOrEvaluation(element)) {
          const label = element.prop('props/label');

          const headerClass = `class-${randomString(16)}`;

          // eslint-disable-next-line max-len
          const recommendationHeaderElement = new RecommendationDescriptionHeaderConstructor();
          recommendationHeaderElement.attr('label/text', `${recommendationGroupIndex}. ${label}`);
          recommendationHeaderElement.attr('body/class', headerClass);
          recommendationHeaderElement.position(
            15,
            recommendationGroupIndex > 1 ? outermostY + 40 : outermostY,
          );
          recommendationHeaderElement.addTo(this.editor.data.graph);

          outermostY = this.editor.graph.getOutermostCoordinate('y');

          const metadata = this.editor.metadata.getFromElement(element);

          if (metadata) {
            const { fixed: recommendations } = metadata;

            if (recommendations.length) {
              const orderedRecommendations = orderRecommendations(recommendations);

              let recommendationIndex = 1;

              for await (const recommendation of orderedRecommendations) {
                let comparatorTextClass = '';
                let interventionTextClass = '';
                let implementationConsiderationsTextClass = '';
                let additionalCommentsTextClass = '';
                let recommendationSourceTextClass = '';
                let linksTextClass = '';

                const REConstructor = await RecommendationDescriptionConstructor(recommendation);

                const RecommendationElement = new REConstructor();

                // creates the accessory classes

                // COMPARATOR text
                comparatorTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('comparator_text/class', comparatorTextClass);

                // INTERVENTION text
                interventionTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('intervention_text/class', interventionTextClass);

                // IMPLEMENTATION CONSIDERATIONS text
                implementationConsiderationsTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('implementation_text/class', implementationConsiderationsTextClass);

                // ADDITIONAL COMMENTS text
                additionalCommentsTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('additional_comments_text/class', additionalCommentsTextClass);

                // RECOMMENDATION SOURCE text
                recommendationSourceTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('recommendation_source_text/class', recommendationSourceTextClass);

                // LINKS text
                linksTextClass = `class-${randomString(16)}`;
                RecommendationElement.attr('links_text/class', linksTextClass);

                // set the reference to the recommendation element on metadata
                recommendation.recommendationElementId = RecommendationElement.id;

                void this.editor.metadata.setMetadata(
                  recommendationIndex - 1,
                  'recommendationElementId',
                  recommendation,
                );

                // text wrapping
                RecommendationElement.attr('implementation_text', { textWrap: { width: elementWidth * 0.8 } });
                RecommendationElement.attr('additional_comments_text', { textWrap: { width: elementWidth * 0.8 } });
                RecommendationElement.attr('recommendation_source_text', { textWrap: { width: elementWidth * 0.8 } });

                RecommendationElement.attr('recommendation_type/text', `${recommendationGroupIndex}.${recommendationIndex}. ${getRecommendationTypeLabel(recommendation.recommendation_type)}`);

                if (recommendation.recommendation_type !== FORMAL_RECOMMENDATION) {
                  RecommendationElement.attr('grade_logo/style', 'display: none');
                }

                RecommendationElement.attr('intervention_type_text/text', recommendation.intervention_type);
                RecommendationElement.attr('original_transcription_text/text', recommendation.description);
                RecommendationElement.attr('original_transcription_text', { textWrap: { width: elementWidth * 0.8 } });

                if (recommendation.certainty_of_the_evidence) {
                  RecommendationElement.attr('certainty_text/text', recommendation.certainty_of_the_evidence);
                  if (recommendation.certainty_of_the_evidence === CERTAINTY.LOW) {
                    RecommendationElement.attr('certainty_icon_1/refX', 365);
                    RecommendationElement.attr('certainty_icon_2/refX', 390);
                    RecommendationElement.attr('certainty_icon_3/style', 'display: none');
                    RecommendationElement.attr('certainty_icon_4/style', 'display: none');
                  } else if (recommendation.certainty_of_the_evidence === CERTAINTY.VERY_LOW) {
                    RecommendationElement.attr('certainty_icon_1/refX', 395);
                    RecommendationElement.attr('certainty_icon_2/style', 'display: none');
                    RecommendationElement.attr('certainty_icon_3/style', 'display: none');
                    RecommendationElement.attr('certainty_icon_4/style', 'display: none');
                  } else if (recommendation.certainty_of_the_evidence === CERTAINTY.MODERATE) {
                    RecommendationElement.attr('certainty_icon_1/refX', 395);
                    RecommendationElement.attr('certainty_icon_2/refX', 420);
                    RecommendationElement.attr('certainty_icon_3/refX', 445);
                    RecommendationElement.attr('certainty_icon_4/style', 'display: none');
                  } else if (recommendation.certainty_of_the_evidence === CERTAINTY.HIGH) {
                    RecommendationElement.attr('certainty_icon_1/refX', 365);
                    RecommendationElement.attr('certainty_icon_2/refX', 390);
                    RecommendationElement.attr('certainty_icon_3/refX', 415);
                    RecommendationElement.attr('certainty_icon_4/refX', 440);
                  }
                } else {
                  RecommendationElement.attr('certainty_label/text', '');
                  RecommendationElement.attr('certainty_icon_1/style', 'display: none');
                  RecommendationElement.attr('certainty_icon_2/style', 'display: none');
                  RecommendationElement.attr('certainty_icon_3/style', 'display: none');
                  RecommendationElement.attr('certainty_icon_4/style', 'display: none');
                }

                RecommendationElement.attr('comparator_text/text', recommendation.comparator);

                RecommendationElement.attr('comparator_text', { textWrap: { width: 200 } });

                if (recommendation.recommendation_type === FORMAL_RECOMMENDATION) {
                  RecommendationElement.attr('recommendation_arrows_image/refX', 230);
                } else if (recommendation.direction) {
                  RecommendationElement.attr('recommendation_arrows_image/refX', 250);
                }

                RecommendationElement.attr('intervention_text/text', recommendation.intervention);
                RecommendationElement.attr('intervention_text/refX', 400);
                RecommendationElement.attr('intervention_text', { textWrap: { width: elementWidth * 0.35 } });
                RecommendationElement.attr('intervention_label/refX', 400);

                if (recommendation.implementation_considerations) {
                  RecommendationElement.attr('implementation_text/text', recommendation.implementation_considerations);

                  // positioning of implementation considerations...
                  //
                } else {
                  RecommendationElement.attr('implementation_label/style', 'display: none');
                }

                const HeaderBoundRect = getElementBoundingRect(headerClass);
                RecommendationElement.position(
                  15,
                  outermostY + 42 + (recommendationIndex === 0 ? HeaderBoundRect?.height || 0 : 0),
                );

                RecommendationElement.size(elementWidth, elementHeight);

                RecommendationElement.addTo(this.editor.data.graph);

                const ComparatorTextBoundingRect = getElementBoundingRect(comparatorTextClass);
                const InterventionTextBoundingRect = getElementBoundingRect(interventionTextClass);

                if (ComparatorTextBoundingRect && InterventionTextBoundingRect) {
                  // eslint-disable-next-line max-len
                  const heightDiff = ComparatorTextBoundingRect.height > InterventionTextBoundingRect.height
                    ? ComparatorTextBoundingRect.height : InterventionTextBoundingRect.height;

                  const implementationLabelRefY = RecommendationElement.attr('implementation_label/refY');

                  RecommendationElement.attr(
                    'implementation_label/refY',
                    implementationLabelRefY + heightDiff,
                  );

                  RecommendationElement.attr(
                    'implementation_text/refY',
                    implementationLabelRefY + heightDiff + 20,
                  );
                }

                // ADDITIONAL COMMENTS
                if (recommendation.additional_comments) {
                  RecommendationElement.attr('additional_comments_text/text', recommendation.additional_comments);

                  if (recommendation.implementation_considerations) {
                    const ICTextBoundingRect = getElementBoundingRect(
                      implementationConsiderationsTextClass,
                    );

                    if (ICTextBoundingRect) {
                      const ITY = RecommendationElement.attr('implementation_text/refY');

                      RecommendationElement.attr('additional_comments_label/refY', ITY + ICTextBoundingRect.height + 20);

                      RecommendationElement.attr('additional_comments_text/refY', ITY + ICTextBoundingRect.height + 45);
                    }
                  }
                } else {
                  RecommendationElement.attr('additional_comments_label/style', 'display: none');
                }

                // RECOMMENDATION SOURCE
                if (recommendation.recommendation_source) {
                  RecommendationElement.attr('recommendation_source_text/text', recommendation.recommendation_source);

                  if (recommendation.additional_comments) {
                    const ACTextBoundingRect = getElementBoundingRect(additionalCommentsTextClass);

                    if (ACTextBoundingRect) {
                      const ACY = RecommendationElement.attr('additional_comments_text/refY');

                      RecommendationElement.attr('recommendation_source_label/refY', ACY + ACTextBoundingRect.height + 20);
                      RecommendationElement.attr('recommendation_source_text/refY', ACY + ACTextBoundingRect.height + 42);
                    }
                  } else if (recommendation.implementation_considerations) {
                    const ICTextBoundingRect = getElementBoundingRect(
                      implementationConsiderationsTextClass,
                    );

                    if (ICTextBoundingRect) {
                      const ITY = RecommendationElement.attr('implementation_text/refY');

                      RecommendationElement.attr('recommendation_source_label/refY', ITY + ICTextBoundingRect.height + 20);
                      RecommendationElement.attr('recommendation_source_text/refY', ITY + ICTextBoundingRect.height + 42);
                    }
                  }
                } else {
                  RecommendationElement.attr('recommendation_source_label/style', 'display: none');
                }

                if (recommendation.links.length) {
                  let linksContent = '';
                  let linkIndex = 0;

                  for (const link of recommendation.links) {
                    if (linkIndex > 0) linksContent += '\n\n';
                    linksContent += `${link.type}: ${link.url}`;
                    linkIndex += 1;
                  }

                  RecommendationElement.attr('links_text/text', linksContent);

                  if (recommendation.recommendation_source) {
                    const RSTextBRect = getElementBoundingRect(recommendationSourceTextClass);

                    if (RSTextBRect) {
                      const RSY = RecommendationElement.attr('recommendation_source_text/refY');

                      RecommendationElement.attr('links_label/refY', RSY + RSTextBRect.height + 30);
                      RecommendationElement.attr('links_text/refY', RSY + RSTextBRect.height + 52);
                    }
                  } else if (recommendation.additional_comments) {
                    const ACTextBoundingRect = getElementBoundingRect(additionalCommentsTextClass);

                    if (ACTextBoundingRect) {
                      const ACY = RecommendationElement.attr('additional_comments_text/refY');

                      RecommendationElement.attr('links_label/refY', ACY + ACTextBoundingRect.height + 30);
                      RecommendationElement.attr('links_text/refY', ACY + ACTextBoundingRect.height + 52);
                    }
                  } else if (recommendation.implementation_considerations) {
                    const ICTextBoundingRect = getElementBoundingRect(
                      implementationConsiderationsTextClass,
                    );

                    if (ICTextBoundingRect) {
                      const ITY = RecommendationElement.attr('implementation_text/refY');

                      RecommendationElement.attr('links_label/refY', ITY + ICTextBoundingRect.height + 30);
                      RecommendationElement.attr('links_text/refY', ITY + ICTextBoundingRect.height + 52);
                    }
                  }
                } else {
                  RecommendationElement.attr('links_label/style', 'display: none');
                }

                if (recommendation.links.length) {
                  elementHeight = Element.readjustRecommendationElementHeight(
                    RecommendationElement,
                    linksTextClass,
                    elementWidth,
                  ) || elementHeight;
                } else if (recommendation.recommendation_source) {
                  elementHeight = Element.readjustRecommendationElementHeight(
                    RecommendationElement,
                    recommendationSourceTextClass,
                    elementWidth,
                  ) || elementHeight;
                } else if (recommendation.additional_comments) {
                  elementHeight = Element.readjustRecommendationElementHeight(
                    RecommendationElement,
                    additionalCommentsTextClass,
                    elementWidth,
                  ) || elementHeight;
                } else if (recommendation.implementation_considerations) {
                  elementHeight = Element.readjustRecommendationElementHeight(
                    RecommendationElement,
                    implementationConsiderationsTextClass,
                    elementWidth,
                  ) || elementHeight;
                } else if (recommendation.comparator) {
                  elementHeight = Element.readjustRecommendationElementHeight(
                    RecommendationElement,
                    comparatorTextClass,
                    elementWidth,
                  ) || elementHeight;
                }

                // adjust element height based on elements...

                // end...
                recommendationHeaderElement.size(elementWidth, 40);

                recommendationIndex += 1;
                outermostY += (elementHeight + 10);
              }
            }
          }
        }
      }
    }
  }

  static removeLinkTools(linkView: dia.LinkView) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const markerVertices = linkView.$el[0].getElementsByClassName('marker-vertices');
    if (markerVertices && markerVertices.length) {
      markerVertices[0].remove();
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    linkView.$el[0].getElementsByClassName('link-tools')[0]?.remove();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const markVertexGroups = linkView.$el[0].getElementsByClassName('marker-vertex-group');
    if (markVertexGroups && markVertexGroups.length) {
      for (const markVertexGroup of markVertexGroups) {
        markVertexGroup.getElementsByClassName('marker-vertex-remove-area')[0]?.remove();
        markVertexGroup.getElementsByClassName('marker-vertex-remove')[0]?.remove();
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    linkView.$el[0].getElementsByClassName('connection-wrap')[0]?.remove();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    linkView.$el[0].getElementsByClassName('marker-arrowheads')[0]?.remove();
  }

  public createRecommendationsTotals(element?: dia.Element) {
    const currentElement = element || this.getSelected();

    if (currentElement) {
      if (
        [CustomElement.ACTION, CustomElement.EVALUATION].includes(currentElement.prop('type'))
      ) {
        const totals: { [key: string]: number } = {};

        const metadata = this.editor.metadata.getFromElement(element);

        if (metadata && metadata.fixed.length) {
          for (const fixedMetadata of metadata.fixed) {
            if (fixedMetadata) {
              if (!totals[fixedMetadata.recommendation_type]) {
                totals[fixedMetadata.recommendation_type] = 1;
              } else {
                totals[fixedMetadata.recommendation_type] += 1;
              }
            }
          }

          if (Object.keys(totals).length) {
            let y = 2;

            for (const { value } of RECOMMENDATION_TYPES) {
              if (totals[value]) {
                void this.create.RecommendationTotal(currentElement, value, totals[value], y);

                y += 20;
              }
            }
          }
        }
      }
    }
  }

  public deleteRecommendationsTotals(element?: dia.Element) {
    const parentElement = element || this.getSelected();

    if (parentElement) {
      for (const currentElement of this.getAll()) {
        if (
          currentElement.prop('type') === CustomElement.RECOMMENDATION_TOTAL
          && currentElement.prop('props/parentElement') === parentElement.id
        ) {
          currentElement.remove();
        }
      }
    }
  }

  public updateRecommendationsTotals(element?: dia.Element) {
    if (!this.editor.data.readOnly) {
      this.deleteRecommendationsTotals();

      const parentElement = element || this.getSelected();

      if (parentElement) {
        this.editor.metadata.clearPendency();

        this.createRecommendationsTotals(parentElement);
      }
    }
  }

  public async createAllRecommendationsTotals() {
    const allElements = this.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        this.updateRecommendationsTotals(element);
      }
    }
  }

  /* public showAllTools() {
    const allElements = this.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        if (
          [CustomElement.ACTION, CustomElement.EVALUATION].includes(element.prop('type'))
          && this.editor.data.paper
        ) {
          const elementView = element.findView(this.editor.data.paper);

          if (elementView) {
            elementView.showTools();
          }
        }
      }
    }
  } */

  public centerViewOnSelected() {
    const selectedElement = this.getSelected();

    if (selectedElement) {
      const {
        y,
        x,
      } = selectedElement.position();

      const stageWrapper = document.getElementById('editor-stage-wrapper');

      if (stageWrapper) {
        const diffToYCenter = (((stageWrapper.offsetHeight - 36) / 2) - 100);
        const diffToXCenter = ((stageWrapper.offsetWidth / 2) - 200);

        const newY = y - diffToYCenter;
        const newX = x - diffToXCenter;

        Editor.setScroll({
          y: newY,
          x: newX,
        });
      }
    }
  }

  public clone() {
    const selectedElement = this.getSelected();

    if (selectedElement) {
      this.deselectAll();

      const labelPrefix = 'Clone';

      const clonedElement = selectedElement.clone();

      const newText = `${labelPrefix} - ${selectedElement.prop('props/label') || ''}`;

      clonedElement.prop('props/label', newText.slice(0, 60));

      clonedElement.translate(40, 40);

      clonedElement.addTo(this.editor.data.graph);

      this.createTools(clonedElement);

      setTimeout(() => {
        this.textarea.setValues([clonedElement]);

        clonedElement.toFront();

        this.select(clonedElement.id);
      }, 100);
    }
  }

  public moveAllElementsDown(moveY: number) {
    const allNewElements = this.getAll();

    for (const element of allNewElements) {
      const { x, y } = element.position();

      element.position(x, y + moveY);
    }

    const allCells = this.editor.data.graph.getCells();

    for (const cell of allCells) {
      const elementType = cell.prop('type');

      if (elementType === 'link') {
        const vertices = cell.prop('vertices');

        if (vertices) {
          const newVertices: { x: number, y: number }[] = [];

          for (const vertex of vertices) {
            newVertices.push({ x: vertex.x, y: vertex.y + moveY });
          }

          cell.prop('vertices', newVertices);
        }
      }
    }
  }

  public redrawAllConnections() {
    // has an obstacle been moved? Then reroute the link.
    this.editor.data.graph.getLinks().forEach((currentLink) => {
      if (this.editor.data.paper) {
        const linkView = this.editor.data.paper.findViewByModel(currentLink);

        if (linkView instanceof dia.LinkView) {
          linkView.requestConnectionUpdate();
        }
      }
    });
  }

  public showPorts(elementId: dia.Cell.ID) {
    if (!this.editor.data.readOnly) {
      const element = this.getById(elementId);

      if (element) {
        const color = element.prop('type') === CustomElement.ACTION ? '#0069Cf' : COLOR_ACCENT;

        element.prop('ports/groups/top/attrs/portBody/fill', color);
        element.prop('ports/groups/bottom/attrs/portBody/fill', color);
        element.prop('ports/groups/in/attrs/portBody/fill', color);
        element.prop('ports/groups/out/attrs/portBody/fill', color);
      }
    }
  }

  public hidePorts(elementId: dia.Cell.ID) {
    const element = this.getById(elementId);

    if (element) {
      element.prop('ports/groups/top/attrs/portBody/fill', 'transparent');
      element.prop('ports/groups/bottom/attrs/portBody/fill', 'transparent');
      element.prop('ports/groups/in/attrs/portBody/fill', 'transparent');
      element.prop('ports/groups/out/attrs/portBody/fill', 'transparent');
    }
  }

  public hideAllPorts() {
    const allElements = this.getAll();

    for (const element of allElements) {
      if (this.isAction(element) || this.isEvaluation(element)) {
        this.hidePorts(element.id);
      }
    }
  }

  public createElementsIndexes() {
    const allElements = this.editor.element.getAll();

    if (allElements.length) {
      let elementIndex = 1;

      for (const element of allElements) {
        const elementType = element.prop('type');

        if ([
          CustomElement.ACTION,
          CustomElement.EVALUATION,
        ].includes(elementType)) {
          const {
            x,
            y,
          } = element.position();

          const metadata = this.editor.metadata.getFromElement(element);

          if (metadata && metadata.fixed.length) {
            const indexElement = new joint.shapes.standard.Rectangle();

            if (elementType === CustomElement.ACTION) {
              indexElement.position(x, y - 30);
            } else if (elementType === CustomElement.EVALUATION) {
              indexElement.position(x + 32, y - 28);
            }

            indexElement.attr('body/stroke', 'black');
            indexElement.attr('body/strokeWidth', 1);
            indexElement.attr('body/rx', 2);
            indexElement.attr('body/ry', 2);
            indexElement.attr('label/text', elementIndex);
            indexElement.attr('label/text-anchor', 'center');
            indexElement.attr('label/style', 'font-size: 16px; border: 1px solid #F00');
            indexElement.attr('label/ref-x', elementIndex > 9 ? -9 : -5);
            indexElement.attr('label/ref-y', 1);

            indexElement.resize(24, 24);

            indexElement.addTo(this.editor.data.graph);

            element.prop('props/elementIndex', elementIndex);

            elementIndex += 1;
          }
        }
      }
    }
  }
}

export default Element;
