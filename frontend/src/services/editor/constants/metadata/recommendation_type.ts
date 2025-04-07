import {
  DIAGNOSIS,
  TREATMENT,
  POPULATION_CLASSIFICATION,
} from 'src/services/editor/constants/metadata/intervention';

import { toDataUrl } from 'src/services/images';

export const FORMAL_RECOMMENDATION = 'formal';
export const INFORMAL_RECOMMENDATION = 'not_formal';
export const GOOD_PRACTICES = 'good_practices';

export const RECOMMENDATION_TYPES = [
  {
    value: FORMAL_RECOMMENDATION,
    label: 'Recomendación formal',
  },
  {
    value: GOOD_PRACTICES,
    label: 'Declaración de buenas prácticas',
  },
  {
    value: INFORMAL_RECOMMENDATION,
    label: 'Recomendación informal',
  },
];

export const getRecommendationTypeLabel = (recommendationType: string) => {
  const recommendationFound = RECOMMENDATION_TYPES.find(
    (type) => type.value === recommendationType,
  );

  return recommendationFound?.label;
};

export const getRecommendationTypeIcon = (type: string) => {
  let url = './imgs/intervention_type_icons/';

  if (type === DIAGNOSIS) {
    url += 'diagnosis.png';
  } else if (type === TREATMENT) {
    url += 'treatment.png';
  } else if (type === POPULATION_CLASSIFICATION) {
    url += 'population_classification.png';
  }

  return url;
};

export const getRecommendationTypeIconBase64 = async (type: string) => {
  let url = '/imgs/intervention_type_icons/';

  if (type === DIAGNOSIS) {
    url += 'diagnosis.png';
  } else if (type === TREATMENT) {
    url += 'treatment.png';
  } else if (type === POPULATION_CLASSIFICATION) {
    url += 'population_classification.png';
  }

  const base64 = await toDataUrl(url);

  return base64 as string || '';
};
