import * as joint from 'jointjs';
import { dia } from 'jointjs';

import Editor, { deselectAllTexts } from 'src/services/editor/index';
import Ports from 'src/services/editor/ports';

import customElements, {
  CustomElement,
  elementName,
  TEXTAREA_CLASSNAME,
} from 'src/services/editor/elements/custom-elements';

import { reactive } from 'vue';

import { autoResizeTextarea } from 'src/services/editor/textarea';
import icons from 'src/services/editor/elements/svg_icons';

// export interface IElementToolsPadding {
//   left: number | 20,
//   top: number | 12,
//   right: number | 10,
//   bottom: number | 16,
// }

// export interface IElementToolsSettings {
//   element: dia.Element,
//   options?: {
//     position?: {
//       x: number,
//       y: number,
//     },
//     padding?: IElementToolsPadding,
//   }
// }

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
  } = reactive({
      selectedId: '',
      elementToCreate: '',
      creationPosition: {
        x: 0,
        y: 0,
      },
      recommendationsRelationsMap: {},
    });

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public getAll() {
    return this.editor.data.graph.getElements();
  }

  public isAction(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.ACTION;

    return this.getSelected()?.prop('type') === CustomElement.ACTION;
  }

  public isEvaluation(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.EVALUATION;

    return this.getSelected()?.prop('type') === CustomElement.EVALUATION;
  }

  public isLane(element?: dia.Element) {
    if (element) return element.prop('type') === CustomElement.LANE;

    return this.getSelected()?.prop('type') === CustomElement.LANE;
  }

  public setCreationPosition(x: number, y: number) {
    this.data.creationPosition = { x, y };
  }

  private removeSelected() {
    this.getSelected()?.remove();

    this.deselectAll();

    this.editor.graph.notSaved();
  }

  private customRemoveButton(x = 0, y = 0) {
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
          fill: 'white',
          cursor: 'pointer',
        },
      }, {
        tagName: 'path',
        selector: 'icon',
        attributes: {
          d: 'M 2.59 -4 L 0 -1.41 L -2.59 -4 L -4 -2.59 L -1 0 L -4 2.59 L -2.59 4 L 0 1.41 L 2.59 4 L 4 2.59 L 1.41 0 L 4 -2.59 L 2.59 -4 z M 0 -10 C -5.53 -10 -10 -5.53 -10 0 s 4.47 10 10 10 s 10 -4.47 10 -10 S 5.53 -10 0 -10 z m 0 18 c -4.41 0 -8 -3.59 -8 -8 s 3.59 -8 8 -8 s 8 3.59 8 8 s -3.59 8 -8 8 z',
          fill: 'red',
          cursor: 'pointer',
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
      } else {
        this.createTools(element);
      }
    });
  }

  public createRecommendationsExpandButton(
    allTools: (joint.elementTools.Button | joint.elementTools.Boundary)[],
    recommendationToggleButtonIndex: number,
  ) {
    const infoButton = new joint.elementTools.Button({
      focusOpacity: 0.5,
      // top-right corner
      x: 222,
      y: 83,
      offset: { x: -5, y: -5 },
      action: (clickEvent) => {
        const originalElementId = clickEvent.currentTarget.getAttribute('model-id');

        const recommendationElementId = this.data.recommendationsRelationsMap[originalElementId];

        const domElement = document.querySelector(`[model-id="${recommendationElementId}"]`);

        const recommendationToggleButton = document.querySelectorAll(`[model-id="${originalElementId}"]`);

        console.log(recommendationToggleButtonIndex, recommendationToggleButton);
        // path element can be the second or third element...
        const path = recommendationToggleButton[recommendationToggleButtonIndex].getElementsByTagName('path');

        if (domElement && path && path.length) {
          if (domElement.getAttribute('display')) {
            domElement.removeAttribute('display');

            path[0].setAttribute('d', icons.minus);
          } else {
            domElement.setAttribute('display', 'none');

            path[0].setAttribute('d', icons.plus);
          }
        }
      },
      markup: [
        {
          tagName: 'circle',
          selector: 'button',
          attributes: {
            r: 12,
            fill: '#DDDDDD',
            cursor: 'pointer',
          },
        },
        {
          tagName: 'path',
          selector: 'icon',
          attributes: {
            d: icons.plus,
            fill: '#999999',
            pointerEvents: 'none',
            cursor: 'pointer',
          },
        },
      ],
    });

    allTools.push(infoButton);
  }

  private static createBoundaryTool() {
    return new joint.elementTools.Boundary({
      padding: 10,
      rotate: true,
      useModelGeometry: true,
    });
  }

  private createTools(element: dia.Element, params?: { removeButtons: { x: number, y: number } }) {
    const allTools: (joint.elementTools.Button | joint.elementTools.Boundary)[] = [];

    if (!this.editor.data.readOnly) {
      allTools.push(Element.createBoundaryTool());

      const removeButton = this.customRemoveButton(
        params?.removeButtons.x,
        params?.removeButtons.y,
      );

      allTools.push(removeButton);
    } else {
      const metadata = this.editor.metadata.getFromElement(element);

      if (metadata?.fixed && metadata.fixed.length) {
        this.createRecommendationsExpandButton(allTools, 1);
      }
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
        }).resize(50, 50).addTo(this.editor.data.graph);

        this.createTools(element);

        deselectAllTexts();
      },
      Action: async () => {
        const element = new customElements.ActionElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
          ports: Ports.generateToAction(),
        }).resize(200, 84).addTo(this.editor.data.graph);

        this.createTools(element);

        this.textarea.createEventHandlers();

        deselectAllTexts();
      },
      Recommendation: async (x: number, y: number, element: dia.Element) => {
        const metadata = this.editor.metadata.getFromElement(element);

        if (metadata && metadata.fixed) {
          const RecommendationElement = customElements.RecommendationElement(metadata.fixed);

          const createdRecommendationElement = new RecommendationElement({
            position: {
              x,
              y,
            },
          }).resize(500, 143).addTo(this.editor.data.graph);

          // create click event handlers for each recommendation
          this.create.RecommendationEventHandlers(createdRecommendationElement.id, element.id);

          createdRecommendationElement.attr('./display', 'none');
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
      Evaluation: async () => {
        const element = new customElements.EvaluationElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
          ports: Ports.generateToEvaluation(),
        }).resize(200, 100).addTo(this.editor.data.graph);

        this.createTools(element);

        this.textarea.createEventHandlers();

        deselectAllTexts();
      },
      End: async () => {
        const element = new customElements.EndElement({
          position: {
            x: this.data.creationPosition.x,
            y: this.data.creationPosition.y,
          },
        }).addTo(this.editor.data.graph);

        this.createTools(element);

        deselectAllTexts();
      },
      Lane: async () => {
        const element = new customElements.LaneElement({
          position: {
            x: 0,
            y: this.data.creationPosition.y,
          },
        }).resize(3000, 50).addTo(this.editor.data.graph);

        this.createTools(element, {
          removeButtons: {
            x: 20,
            y: 17,
          },
        });

        this.textarea.createEventHandlers();

        deselectAllTexts();
      },
    };
  }

  public deselectAll() {
    const elements = this.editor.data.graph.getElements();

    // remove stroke from the selected element
    elements.forEach((element) => {
      // hide element tools
      if (this.editor.data.paper && !this.editor.data.readOnly) {
        element.findView(this.editor.data.paper).hideTools();
      } else if (this.editor.data.readOnly) {
        this.createReadonlyTools(element, false);
      }
    });

    this.editor.element.data.selectedId = '';
  }

  public async setProp(
    propName: string,
    value: boolean | string | number | object | undefined | null,
  ) {
    this.getSelected()?.prop(`props/${propName}`, value);

    // avoid "setNotSavedChanges" without changing anything
    // if (commitChanges) {
    //   await this.joint.setNotSavedChanges(true);
    // }
  }

  public async setAttr(attrName: string, value: string) {
    this.getSelected()?.attr(attrName, value);

    // await this.joint.setNotSavedChanges(true);
  }

  public getById(id: dia.Cell.ID): dia.Element | undefined {
    return this.editor.data.graph.getElements().find((element) => element.id === id);
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
        this.createRecommendationsExpandButton(allTools, showBoundary ? 2 : 1);
      }

      const toolsView = new joint.dia.ToolsView({
        tools: [...allTools],
      });

      elementView.addTools(toolsView);
    }
  }

  public select(elementId: dia.Cell.ID) {
    this.deselectAll();

    const element = this.getById(elementId);

    if (element && this.editor.data.paper) {
      const elementView = element.findView(this.editor.data.paper);

      if (elementView) {
        if (this.editor.data.readOnly) {
          this.createReadonlyTools(element, true);
        }

        elementView.showTools();

        this.data.selectedId = elementId;

        console.log('Selected element props:');
        console.log({ ...element });

        const selectedElement = this.getSelected();

        if (selectedElement && selectedElement.prop('type') === CustomElement.LANE) {
          const { y } = selectedElement.position();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          selectedElement.position(0, y);

          if (document.activeElement?.tagName !== 'INPUT') {
            deselectAllTexts();
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

    return this.getSelected()?.prop('props/label') || '';
  }

  public getTitle() {
    return this.getSelected()?.prop('title') || '';
  }

  public async setTitle(title: string) {
    await this.setProp('title', title);

    await this.setAttr('label/text', title);
  }

  public getName() {
    const elementType = this.getSelected()?.prop('type');

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

        return domElement?.getElementsByTagName('textarea')[0];
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
            }
          }

          setTimeout(() => {
            deselectAllTexts();
          }, 1);
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
    };
  }

  public createRecommendations() {
    const allElements = this.getAll();

    if (allElements.length) {
      for (const element of allElements) {
        if (element.prop('type') === CustomElement.ACTION) {
          const { x, y } = element.position();

          void this.create.Recommendation(x, y + 94, element);
        } else if (element.prop('type') === CustomElement.EVALUATION) {
          const { x, y } = element.position();

          void this.create.Recommendation(x + 1, y + 111, element);
        }
      }
    }
  }

  public showAllTools() {
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
  }
}

export default Element;
