import { dia } from 'jointjs';
import { CustomElement } from 'src/services/editor/elements/custom-elements';
import { IFixedMetadata } from 'src/services/editor/constants/metadata';

import { toDataUrl } from 'src/services/images';
import {
  goodPracticeArrowsImageBase64,
  recommendationArrowsImageBase64,
} from 'src/services/recommendations';

import {
  getRecommendationTypeIconBase64,
  FORMAL_RECOMMENDATION,
} from 'src/services/editor/constants/metadata/recommendation_type';

const defaults = {
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: 'white',
      strokeWidth: 1,
      stroke: '#AAAAAA',
      rx: 5,
    },
    recommendation_type: {
      style: 'font-size: 18px; font-weight: 500',
      refX: 15,
      refY: 20,
    },
    grade_logo: {
      xlinkHref: '',
      refX: 260,
      refY: 17,
      height: 24,
    },
    intervention_type_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 70,
      text: 'Tipo de intervención',
    },
    intervention_type_text: {
      refX: 15,
      refY: 93,
    },
    intervention_type_image: {
      xlinkHref: '',
      refX: 170,
      refY: 68,
      height: 40,
    },
    certainty_label: {
      style: 'font-weight: bold',
      refX: 330,
      refY: 70,
      text: 'Certeza de la evidencia',
    },
    certainty_text: {
      refX: 330,
      refY: 93,
    },
    certainty_icon_1: {
      xlinkHref: '',
      refX: 365,
      refY: 90,
      height: 20,
    },
    certainty_icon_2: {
      xlinkHref: '',
      refX: 365,
      refY: 90,
      height: 20,
    },
    certainty_icon_3: {
      xlinkHref: '',
      refX: 365,
      refY: 90,
      height: 20,
    },
    certainty_icon_4: {
      xlinkHref: '',
      refX: 365,
      refY: 90,
      height: 20,
    },
    original_transcription_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 125,
      text: 'Transcripción original',
    },
    original_transcription_text: {
      style: 'line-height: 200%;',
      refX: 15,
      refY: 148,
    },
    comparator_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 200,
      text: 'Comparador',
    },
    comparator_text: {
      style: 'line-height: 200%;',
      refX: 15,
      refY: 220,
    },
    intervention_label: {
      style: 'font-weight: bold',
      refX: 600,
      refY: 200,
      text: 'Intervención',
    },
    intervention_text: {
      style: 'line-height: 200%;',
      refX: 600,
      refY: 220,
    },
    recommendation_arrows_image: {
      xlinkHref: '',
      refX: 300,
      refY: 200,
    },
    implementation_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 260,
      text: 'Consideración de implementación',
    },
    implementation_text: {
      refX: 15,
      refY: 285,
    },
    additional_comments_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 260,
      text: 'Comentarios adicionales',
    },
    additional_comments_text: {
      refX: 15,
      refY: 285,
    },
    recommendation_source_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 260,
      text: 'Fuente de recomendación',
    },
    recommendation_source_text: {
      refX: 15,
      refY: 285,
    },
    links_label: {
      style: 'font-weight: bold',
      refX: 15,
      refY: 260,
      text: 'Enlaces',
    },
    links_text: {
      refX: 15,
      refY: 285,
    },
  },
};

const markup = {
  markup: [{
    tagName: 'rect',
    selector: 'body',
    className: 'recommendation-print-element',
  }, {
    tagName: 'text',
    selector: 'recommendation_type',
  }, {
    tagName: 'image',
    selector: 'grade_logo',
  }, {
    tagName: 'text',
    selector: 'intervention_type_label',
  }, {
    tagName: 'text',
    selector: 'intervention_type_text',
  }, {
    tagName: 'image',
    selector: 'intervention_type_image',
  }, {
    tagName: 'text',
    selector: 'certainty_label',
  }, {
    tagName: 'text',
    selector: 'certainty_text',
  }, {
    tagName: 'image',
    selector: 'certainty_icon_1',
  }, {
    tagName: 'image',
    selector: 'certainty_icon_2',
  }, {
    tagName: 'image',
    selector: 'certainty_icon_3',
  }, {
    tagName: 'image',
    selector: 'certainty_icon_4',
  }, {
    tagName: 'image',
    selector: 'certainty_icon_5',
  }, {
    tagName: 'text',
    selector: 'original_transcription_label',
  }, {
    tagName: 'text',
    selector: 'original_transcription_text',
  }, {
    tagName: 'text',
    selector: 'comparator_label',
  }, {
    tagName: 'text',
    selector: 'comparator_text',
  }, {
    tagName: 'text',
    selector: 'intervention_label',
  }, {
    tagName: 'text',
    selector: 'intervention_text',
  }, {
    tagName: 'image',
    selector: 'recommendation_arrows_image',
  }, {
    tagName: 'text',
    selector: 'implementation_label',
  }, {
    tagName: 'text',
    selector: 'implementation_text',
  }, {
    tagName: 'text',
    selector: 'additional_comments_label',
  }, {
    tagName: 'text',
    selector: 'additional_comments_text',
  }, {
    tagName: 'text',
    selector: 'recommendation_source_label',
  }, {
    tagName: 'text',
    selector: 'recommendation_source_text',
  }, {
    tagName: 'text',
    selector: 'links_label',
  }, {
    tagName: 'text',
    selector: 'links_text',
  }],
};

export const RecommendationDescriptionConstructor = async (recommendation: IFixedMetadata) => {
  const newDefaults = { ...defaults };

  newDefaults.attrs.intervention_type_image.xlinkHref = await getRecommendationTypeIconBase64(
    recommendation.intervention_type,
  );

  newDefaults.attrs.grade_logo.xlinkHref = await toDataUrl('/imgs/grade_logo.png');

  const certaintyIconBase64 = await toDataUrl('/imgs/certainty.png');

  newDefaults.attrs.certainty_icon_1.xlinkHref = certaintyIconBase64;
  newDefaults.attrs.certainty_icon_2.xlinkHref = certaintyIconBase64;
  newDefaults.attrs.certainty_icon_3.xlinkHref = certaintyIconBase64;
  newDefaults.attrs.certainty_icon_4.xlinkHref = certaintyIconBase64;

  if (recommendation.recommendation_type === FORMAL_RECOMMENDATION) {
    newDefaults.attrs.recommendation_arrows_image.xlinkHref = await recommendationArrowsImageBase64(
      recommendation,
    );
  } else if (recommendation.direction) {
    newDefaults.attrs.recommendation_arrows_image.xlinkHref = await goodPracticeArrowsImageBase64(
      recommendation,
    );
  }

  return dia.Element.define(
    CustomElement.RECOMMENDATION_DESCRIPTION,
    newDefaults,
    markup,
  );
};

const headerDefaults = {
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: '#F0F0F0',
      strokeWidth: 0,
      stroke: '',
      rx: 5,
    },
    label: {
      style: 'font-size: 18px; font-weight: 500',
      refX: 15,
      refY: 13,
    },
  },
};

const headerMarkup = {
  markup: [{
    tagName: 'rect',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }],
};

export const RecommendationDescriptionHeaderConstructor = dia.Element.define(
  CustomElement.RECOMMENDATION_DESCRIPTION,
  headerDefaults,
  headerMarkup,
);
