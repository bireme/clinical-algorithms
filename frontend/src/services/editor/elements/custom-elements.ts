import * as joint from 'jointjs';
import { IFixedMetadata } from 'src/services/editor/constants/metadata';
import { orderRecommendations, recommendationArrowsLine } from 'src/services/recommendations';
import {
  getRecommendationTypeLabel,
} from 'src/services/editor/constants/metadata/recommendation_type';
import icons from 'src/services/editor/elements/svg_icons';
import { COLOR_ACCENT, COLOR_PRIMARY } from 'src/services/colors';

export enum CustomElement {
  START = 'StartElement',
  ACTION = 'ActionElement',
  EVALUATION = 'EvaluationElement',
  RECOMMENDATION = 'RecommendationElement',
  RECOMMENDATION_TOTAL = 'RecommendationTotalElement',
  RECOMMENDATION_TOGGLER = 'RecommendationTogglerElement',
  RECOMMENDATION_DESCRIPTION = 'RecommendationDescriptionElement',
  RECOMMENDATION_DESCRIPTION_HEADER = 'RecommendationDescriptionHeaderElement',
  END = 'EndElement',
  LINK = 'LinkElement',
  // CARD = 'ElementCardExample',
  LANE = 'LaneElement',
  PDF_HEADER = 'PDFHeaderElement',
  PDF_FOOTER = 'PDFFooterElement',
}

export const elementName: {
  [key: string]: string,
} = {
  [CustomElement.START]: 'Start',
  [CustomElement.ACTION]: 'Action',
  [CustomElement.EVALUATION]: 'Evaluation',
  [CustomElement.RECOMMENDATION]: 'Recommendation',
  [CustomElement.RECOMMENDATION_TOTAL]: 'RecommendationTotal',
  [CustomElement.RECOMMENDATION_TOGGLER]: 'RecommendationToggler',
  [CustomElement.RECOMMENDATION_DESCRIPTION]: 'RecommendationDescription',
  [CustomElement.RECOMMENDATION_DESCRIPTION_HEADER]: 'RecommendationDescriptionHeader',
  [CustomElement.END]: 'End',
  [CustomElement.LINK]: 'Link',
  [CustomElement.LANE]: 'Time',
  [CustomElement.PDF_HEADER]: 'PDFHeader',
  [CustomElement.PDF_FOOTER]: 'PDFFooter',
};

export const ROUND_PORT = {
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
  ],
  attrs: {
    body: {
      magnet: true,
      width: 11,
      height: 11,
      x: 0,
      y: 0,
      fill: '#21BA45',
      rx: 6,
      ry: 6,
    },
  },
};

export const ACTION_PORT = {
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
  ],
  attrs: {
    body: {
      magnet: true,
      width: 200,
      height: 11,
      x: 0,
      y: 0,
      fill: '#0089Ef',
      rx: 5,
      ry: 5,
    },
  },
};

export const EVALUATION_PORT = {
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
  ],
  attrs: {
    body: {
      magnet: true,
      width: 138,
      height: 11,
      x: 0,
      y: 0,
      fill: '#ef7542',
      rx: 5,
      ry: 5,
    },
  },
};

export const TEXTAREA_CLASSNAME = 'element-textarea-input';

const getRecommendationTotalAttributes = () => ({
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      strokeWidth: 0,
      fill: '#445566',
      rx: 2,
      ry: 2,
    },
    label: {
      textVerticalAnchor: 'middle',
      textAnchor: 'middle',
      x: 'calc(0.5*w)',
      y: 'calc(0.55*h)',
      fontSize: 12,
      fontFamily: 'Courier New, sans-serif',
      fill: 'white',
      text: '1RF',
    },
  },
});

export const RecommendationTotalConstructor = (hasPendency: boolean) => {
  const params = { ...getRecommendationTotalAttributes() };

  params.attrs.body.fill = hasPendency ? '#FF0000' : params.attrs.body.fill;

  return joint.dia.Element.define(
    CustomElement.RECOMMENDATION_TOTAL,
    {
      ...params,
    },
    {
      markup: [{
        tagName: 'rect',
        selector: 'body',
      }, {
        tagName: 'text',
        selector: 'label',
      }],
    },
  );
};

const customElements = {
  [CustomElement.RECOMMENDATION_TOGGLER]: joint.dia.Element.define(
    CustomElement.RECOMMENDATION_TOGGLER,
    {
      attrs: {
        button: {
          r: 12,
          fill: COLOR_PRIMARY,
          cursor: 'pointer',
        },
        icon: {
          d: icons.plus,
          fill: 'white',
          pointerEvents: 'none',
          cursor: 'pointer',
        },
      },
    },
    {
      markup: [{
        tagName: 'circle',
        selector: 'button',
      }, {
        tagName: 'path',
        selector: 'icon',
      }],
    },
  ),

  [CustomElement.RECOMMENDATION]: (
    recommendations: IFixedMetadata[],
    recommendationDivId: string,
  ) => {
    let items = '';

    const orderedRecommendation = orderRecommendations(recommendations);

    let lastRecommendation: IFixedMetadata | null = null;

    for (const recommendation of orderedRecommendation) {
      if (recommendation.intervention && recommendation.comparator) {
        if (
          lastRecommendation?.recommendation_type !== recommendation.recommendation_type
          || lastRecommendation?.intervention_type !== recommendation.intervention_type
        ) {
          items += '<div class="row full-width bg-grey-2"><div class="col-12 text-center recommendation-title">';
          items += getRecommendationTypeLabel(recommendation.recommendation_type);
          items += ` - Intervention type: ${recommendation.intervention_type}`;
          items += '</div></div>';
        }

        items += `<div class="row hover" data-index="${recommendation.index}">`;

        items += recommendationArrowsLine(recommendation, true, true);

        items += '</div>';

        lastRecommendation = { ...recommendation };
      }
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
          id="${recommendationDivId}"
        >
          <div class="text-caption">
            ${items}
          </div>
        </div>
      </foreignObject>
    `,
    });
  },

  [CustomElement.RECOMMENDATION_TOTAL]: joint.dia.Element.define(
    CustomElement.RECOMMENDATION_TOTAL,
    {
      ...getRecommendationTotalAttributes(),
    },
    {
      markup: [{
        tagName: 'rect',
        selector: 'body',
      }, {
        tagName: 'text',
        selector: 'label',
      }],
    },
  ),

  [CustomElement.START]: joint.dia.Element.define(CustomElement.START, {
    attrs: {
      body: {
        width: 'calc(w)',
        height: 'calc(h)',
        rx: 20,
        ry: 20,
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

  [CustomElement.ACTION]: joint.dia.Element.define(CustomElement.ACTION, {
    attrs: {
      foreignObject: {
        width: 'calc(w)',
        height: 'calc(h)',
      },
    },
  }, {
    markup: joint.util.svg/* xml */`
      <rect
        width="200"
        height="100"
        fill="#E2F3FB"
        rx="5"
        ry="5"
        stroke="${COLOR_PRIMARY}"
        stroke-width="3"
      />

      <rect
        x="8"
        y="8"
        width="184"
        height="84"
        fill="#DAE7EF"
        rx="2"
        ry="2"
      />

      <foreignObject
        @selector="foreignObject"
      >
        <div xmlns="http://www.w3.org/1999/xhtml">
          <div>
            <textarea
              class="${TEXTAREA_CLASSNAME}"
              autocomplete="off"
              placeholder="Acción"
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
      <polygon
        points="1.924,54.525 32.234,2.025 171.614,2.025 201.924,54.525 171.614,107.025 32.234,107.025 "
        transform="matrix(0.98521761,0,0,0.92490192,0,0)"
        fill="#fdede3"
        stroke="${COLOR_ACCENT}"
        stroke-width="3"
      />

      <polygon
        points="166.548,9.025 192.758,54.525 166.548,100.025 37.968,100.025 11.758,54.525 37.968,9.025 "
        transform="matrix(1,0,0,0.93690874,-2,-1)"
        fill="#eddbd1"
        stroke-width="0"
      />

      <foreignObject
        @selector="foreignObject"
      >
        <div xmlns="http://www.w3.org/1999/xhtml">
          <div>
            <textarea
              class="${TEXTAREA_CLASSNAME}"
              autocomplete="off"
              placeholder="Evaluación"
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
            <hr style="border-top:2px solid #777777;margin-top:48px" />

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
    // size: {
    //   width: 40,
    //   height: 40,
    // },
    attrs: {
      body: {
        width: 'calc(w)',
        height: 'calc(h)',
        rx: 20,
        ry: 20,
        fill: 'white',
        stroke: '#FF0000',
        strokeWidth: 3,
      },
      // body: {
      //   width: 40,
      //   height: 40,
      //   rx: 25,
      //   ry: 25,
      //   fill: 'white',
      //   stroke: '#FF0000',
      //   strokeWidth: 3,
      // },
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
