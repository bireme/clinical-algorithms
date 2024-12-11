import { INTERVENTION_TYPES } from 'src/services/editor/constants/metadata/intervention';
import { toDataUrl } from 'src/services/images';

export const FORMAL_RECOMMENDATION = 'formal';
export const INFORMAL_RECOMMENDATION = 'not_formal';
export const GOOD_PRACTICES = 'good_practices';

export const RECOMMENDATION_TYPES = [
  {
    value: FORMAL_RECOMMENDATION,
    label: 'Formal recommendation',
  },
  {
    value: GOOD_PRACTICES,
    label: 'Good practice statement',
  },
  {
    value: INFORMAL_RECOMMENDATION,
    label: 'Informal recommendation',
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

  if (type === INTERVENTION_TYPES.DIAGNOSIS) {
    url += 'diagnosis.png';
  } else if (type === INTERVENTION_TYPES.TREATMENT) {
    url += 'treatment.png';
  } else if (type === INTERVENTION_TYPES.POPULATION_CLASSIFICATION) {
    url += 'population_classification.png';
  }

  return url;
};

export const getRecommendationTypeIconBase64 = async (type: string) => {
  let url = '/imgs/intervention_type_icons/';

  if (type === INTERVENTION_TYPES.DIAGNOSIS) {
    url += 'diagnosis.png';
  } else if (type === INTERVENTION_TYPES.TREATMENT) {
    url += 'treatment.png';
  } else if (type === INTERVENTION_TYPES.POPULATION_CLASSIFICATION) {
    url += 'population_classification.png';
  }

  const base64 = await toDataUrl(url);

  return base64 as string || '';
};
