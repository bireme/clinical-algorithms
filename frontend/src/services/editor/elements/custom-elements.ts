import * as joint from 'jointjs';
import { IFixedMetadata } from 'src/services/editor/metadata';

export enum CustomElement {
  START = 'StartElement',
  ACTION = 'ActionElement',
  EVALUATION = 'EvaluationElement',
  RECOMMENDATION = 'RecommendationElement',
  END = 'EndElement',
  LINK = 'LinkElement',
  // CARD = 'ElementCardExample',
  LANE = 'LaneElement',
}

export const elementName: {
  [key: string]: string,
} = {
  [CustomElement.START]: 'Início',
  [CustomElement.ACTION]: 'Acción',
  [CustomElement.EVALUATION]: 'Evaluación',
  [CustomElement.RECOMMENDATION]: 'Recomendación',
  [CustomElement.END]: 'Fin',
  [CustomElement.LINK]: 'Enlace',
  // [CustomElement.CARD]: 'Card interativo',
  [CustomElement.LANE]: 'Tiempo',
};

export const PORT = {
  attrs: {
    body: {
      magnet: true,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      rx: 5,
      ry: 5,
      fill: 'grey',
    },
  },
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
  ],
};

export const TEXTAREA_CLASSNAME = 'element-textarea-input';

const customElements = {
  [CustomElement.LINK]: joint.dia.Link.define(CustomElement.LINK, {
    connector: { name: 'rounded' },
    router: { name: 'manhattan' },
    attrs: {
      line: {
        connection: true,
        stroke: 'grey',
        strokeWidth: 2,
        targetAnchor: {},
        targetMarker: {
          stroke: 'none',
          strokeWidth: 0,
          type: 'path',
          fill: 'grey',
          d: 'M 10 -10 -2 0 10 10 Z',
        },
      },
    },
  }, {
    markup: [{
      tagName: 'path',
      selector: 'line',
      attributes: {
        fill: 'none',
        pointerEvents: 'none',
      },
    }],
  }),

  [CustomElement.START]: joint.dia.Element.define(CustomElement.START, {
    attrs: {
      body: {
        width: 'calc(w)',
        height: 'calc(h)',
        rx: 25,
        ry: 25,
        fill: 'white',
        stroke: '#21BA45',
        strokeWidth: 3,
      },
    },
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
    }, {
      tagName: 'text',
      selector: 'label',
    }, {
      tagName: 'path',
      selector: 'icon',
    }],
  }),

  [CustomElement.RECOMMENDATION]: (
    recommendations: IFixedMetadata[],
  ) => {
    let items = '';

    for (const recommendation of recommendations) {
      items += `<li>${recommendation.intervention} - ${recommendation.direction} - ${recommendation.strength}</li>`;
    }

    return joint.dia.Element.define(CustomElement.RECOMMENDATION, {
      attrs: {
        foreignObject: {
          width: 'calc(w)',
          height: 'calc(h)',
        },
      },
    }, {
      markup: joint.util.svg/* xml */`
      <foreignObject
        @selector="foreignObject"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="recommendation-element"
        >
          <ul class="text-caption">
            ${items}
          </ul>
        </div>
      </foreignObject>
    `,
    });
  },

  [CustomElement.ACTION]: joint.dia.Element.define(CustomElement.ACTION, {
    attrs: {
      foreignObject: {
        width: 'calc(w)',
        height: 'calc(h)',
      },
    },
  }, {
    markup: joint.util.svg/* xml */`
      <foreignObject
        @selector="foreignObject"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="editor-action-element"
        >
          <div class="element-textarea-container">
            <!--<input
              class="${TEXTAREA_CLASSNAME}"
              placeholder="Acción"
              contenteditable="true"
              maxlength="70"
              spellcheck="false"
            />-->
            <textarea
              class="${TEXTAREA_CLASSNAME}"
              autocomplete="off"
              placeholder="Ação"
              contenteditable="true"
              maxlength="60"
              spellcheck="false"
              rows="1"
              @selector="elementLabel"
            ></textarea>
          </div>
        </div>
      </foreignObject>
    `,
  }),

  [CustomElement.EVALUATION]: joint.dia.Element.define(CustomElement.EVALUATION, {
    attrs: {
      foreignObject: {
        width: 'calc(w)',
        height: 'calc(h)',
      },
    },
  }, {
    markup: joint.util.svg/* xml */`
      <foreignObject
        @selector="foreignObject"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="editor-evaluation-element"
        >
          <div>
            <textarea
              class="${TEXTAREA_CLASSNAME}"
              autocomplete="off"
              placeholder="Ação"
              contenteditable="true"
              maxlength="60"
              spellcheck="false"
              rows="1"
              @selector="elementLabel"
            ></textarea>
          </div>
        </div>
      </foreignObject>
    `,
  }),

  // OLD ACTION (without editing text inside element)
  // [Element.ACTION]: joint.dia.Element.define(Element.ACTION, {
  //   size: {
  //     width: 50,
  //     height: 50,
  //   },
  //   attrs: {
  //     body: {
  //       width: 'calc(w)',
  //       height: 'calc(h)',
  //       fill: '#FFFFFF',
  //       stroke: '#0099FF',
  //       strokeWidth: 3,
  //       rx: 5,
  //       ry: 5,
  //     },
  //     label: {
  //       textVerticalAnchor: 'middle',
  //       textAnchor: 'middle',
  //       x: 'calc(0.5*w)',
  //       y: 'calc(0.5*h)',
  //       fontSize: 14,
  //       fill: '#0099FF',
  //       text: 'Ação',
  //     },
  //   },
  // }, {
  //   markup: [{
  //     tagName: 'rect',
  //     selector: 'body',
  //   }, {
  //     tagName: 'text',
  //     selector: 'label',
  //   }, {
  //     tagName: 'path',
  //     selector: 'icon',
  //   }],
  // }),

  [CustomElement.LANE]: joint.dia.Element.define(CustomElement.LANE, {
    attrs: {
      foreignObject: {
        width: 'calc(w)',
        height: 'calc(h)',
      },
    },
  }, {
    markup: joint.util.svg/* xml */`
      <foreignObject
        @selector="foreignObject"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          class="editor-lane-element"
        >
          <div
            style="cursor:move"
          >
            <div
              style="height:20px;border-bottom:2px solid #777777;margin-top:30px"
            >
            </div>
            <input
              class="${TEXTAREA_CLASSNAME}"
              placeholder="Título"
              contenteditable="true"
              maxlength="60"
              spellcheck="false"
              style="width:530px"
            />
          </div>
        </div>
      </foreignObject>
    `,
  }),

  [CustomElement.END]: joint.dia.Element.define(CustomElement.END, {
    size: {
      width: 50,
      height: 50,
    },
    attrs: {
      body: {
        width: 50,
        height: 50,
        rx: 25,
        ry: 25,
        fill: 'white',
        stroke: '#FF0000',
        strokeWidth: 3,
      },
    },
  }, {
    markup: [{
      tagName: 'rect',
      selector: 'body',
    }, {
      tagName: 'text',
      selector: 'label',
    }, {
      tagName: 'path',
      selector: 'icon',
    }],
  }),
};

export default customElements;
