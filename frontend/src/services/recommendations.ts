import {
  CONDITIONAL_RECOMMENDATION,
  STRONG_RECOMMENDATION,
} from 'src/services/editor/constants/metadata/recommendation_strength';

import {
  AGAINST_THE_INTERVENTION,
  IN_FAVOR_OF_THE_INTERVENTION,
  BOTH,
} from 'src/services/editor/constants/metadata/direction';

import { IFixedMetadata } from 'src/services/editor/constants/metadata';
import {
  FORMAL_RECOMMENDATION,
  GOOD_PRACTICES,
  INFORMAL_RECOMMENDATION,
} from 'src/services/editor/constants/metadata/recommendation_type';
import {
  DIAGNOSIS,
  POPULATION_CLASSIFICATION,
  TREATMENT,
} from 'src/services/editor/constants/metadata/intervention';

import GradeIcon from 'src/assets/imgs/grade_logo.png';
import { toDataUrl } from 'src/services/images';

export const goodPracticeArrowsImage = (data: IFixedMetadata) => {
  if (data.direction === IN_FAVOR_OF_THE_INTERVENTION) {
    return 'imgs/recommendation_arrows/in_favor.png';
  }

  if (data.direction === AGAINST_THE_INTERVENTION) {
    return 'imgs/recommendation_arrows/against.png';
  }

  return 'imgs/recommendation_arrows/both.png';
};

export const goodPracticeArrowsImageBase64 = async (data: IFixedMetadata) => {
  let url = '';

  if (data.direction === IN_FAVOR_OF_THE_INTERVENTION) {
    url = '/imgs/recommendation_arrows/in_favor.png';
  } else if (data.direction === AGAINST_THE_INTERVENTION) {
    url = '/imgs/recommendation_arrows/against.png';
  } else {
    url = '/imgs/recommendation_arrows/both.png';
  }

  const base64 = await toDataUrl(url);

  return base64 as string || '';
};

export const recommendationArrowsImage = (data: IFixedMetadata) => {
  // STRONG, IN FAVOR
  if (
    data.strength === STRONG_RECOMMENDATION
    && data.direction === IN_FAVOR_OF_THE_INTERVENTION
  ) {
    return 'imgs/recommendation_arrows/strong_in_favor_intervention.png';
  }

  // CONDITIONAL, IN FAVOR
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === IN_FAVOR_OF_THE_INTERVENTION
  ) {
    return 'imgs/recommendation_arrows/conditional_in_favor_intervention.png';
  }

  // CONDITIONAL, BOTH
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === BOTH
  ) {
    return 'imgs/recommendation_arrows/conditional_both_directions.png';
  }

  // CONDITIONAL, AGAINST
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === AGAINST_THE_INTERVENTION
  ) {
    return 'imgs/recommendation_arrows/conditional_in_favor_comparator.png';
  }

  // STRONG, AGAINST
  if (
    data.strength === STRONG_RECOMMENDATION
    && data.direction === AGAINST_THE_INTERVENTION
  ) {
    return 'imgs/recommendation_arrows/strong_in_favor_comparator.png';
  }

  return '';
};

export const recommendationArrowsImageBase64 = async (data: IFixedMetadata) => {
  let url = '';

  // STRONG, IN FAVOR
  if (
    data.strength === STRONG_RECOMMENDATION
    && data.direction === IN_FAVOR_OF_THE_INTERVENTION
  ) {
    url = '/imgs/recommendation_arrows/strong_in_favor_intervention.png';
  }

  // CONDITIONAL, IN FAVOR
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === IN_FAVOR_OF_THE_INTERVENTION
  ) {
    url = '/imgs/recommendation_arrows/conditional_in_favor_intervention.png';
  }

  // CONDITIONAL, BOTH
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === BOTH
  ) {
    url = '/imgs/recommendation_arrows/conditional_both_directions.png';
  }

  // CONDITIONAL, AGAINST
  if (
    data.strength === CONDITIONAL_RECOMMENDATION
    && data.direction === AGAINST_THE_INTERVENTION
  ) {
    url = '/imgs/recommendation_arrows/conditional_in_favor_comparator.png';
  }

  // STRONG, AGAINST
  if (
    data.strength === STRONG_RECOMMENDATION
    && data.direction === AGAINST_THE_INTERVENTION
  ) {
    url = '/imgs/recommendation_arrows/strong_in_favor_comparator.png';
  }

  const base64 = await toDataUrl(url);

  return base64 as string || '';
};

export const recommendationArrowsLine = (
  recommendation: IFixedMetadata,
  showGradeLogo = false,
  coloredTitles = false,
) => {
  let items = '';

  if (
    recommendation.recommendation_type === FORMAL_RECOMMENDATION
    && showGradeLogo
  ) {
    items += '<div class="row">';
    items += '<div class="col-10 flex items-center">';
  }

  items += '<div class="row full-width">';

  items += '<div class="col-4 flex items-center text-caption q-pa-sm">';
  if (coloredTitles) {
    items += `<div><b class="text-primary">Comparator:</b><br/>${recommendation.comparator}</div>`;
  } else {
    items += `<div><b>Comparator:</b><br/>${recommendation.comparator}</div>`;
  }
  items += '</div>';

  items += '<div class="col-4 flex items-center justify-center">';
  if (recommendation.recommendation_type) {
    if (recommendation.recommendation_type === FORMAL_RECOMMENDATION) {
      if (recommendation.strength && recommendation.direction) {
        items += `<img src="${recommendationArrowsImage(recommendation)}" alt="" />`;
      }
    } else if (recommendation.direction) {
      items += `<img src="${goodPracticeArrowsImage(recommendation)}" alt="" />`;
    }
  }
  items += '</div>';

  items += '<div class="col-4 flex items-center text-caption q-pa-sm">';
  if (coloredTitles) {
    items += `<div><b class="text-primary">Intervention:</b><br/>${recommendation.intervention}</div>`;
  } else {
    items += `<div><b>Intervention:</b><br/>${recommendation.intervention}</div>`;
  }
  items += '</div>';

  items += '</div>';

  if (
    recommendation.recommendation_type === FORMAL_RECOMMENDATION
    && showGradeLogo
  ) {
    items += '</div>';
    items += '<div class="col-2 flex items-center justify-center">';
    items += `<img src="${GradeIcon}" style="width:72%" />`;
    items += '</div>';
    items += '</div>';
  }

  return items;
};

export const orderRecommendations = (recommendations: IFixedMetadata[]) => {
  const orderedItems: IFixedMetadata[] = [];

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === FORMAL_RECOMMENDATION
      && recommendation.intervention_type === TREATMENT
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === FORMAL_RECOMMENDATION
      && recommendation.intervention_type === DIAGNOSIS
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === FORMAL_RECOMMENDATION
      && recommendation.intervention_type === POPULATION_CLASSIFICATION
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === INFORMAL_RECOMMENDATION
      && recommendation.intervention_type === TREATMENT
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === INFORMAL_RECOMMENDATION
      && recommendation.intervention_type === DIAGNOSIS
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === INFORMAL_RECOMMENDATION
      && recommendation.intervention_type === POPULATION_CLASSIFICATION
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === GOOD_PRACTICES
      && recommendation.intervention_type === TREATMENT
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === GOOD_PRACTICES
      && recommendation.intervention_type === DIAGNOSIS
    ) {
      orderedItems.push(recommendation);
    }
  }

  for (const recommendation of recommendations) {
    if (
      recommendation.recommendation_type === GOOD_PRACTICES
      && recommendation.intervention_type === POPULATION_CLASSIFICATION
    ) {
      orderedItems.push(recommendation);
    }
  }

  let index = 1;
  for (const orderedItem of orderedItems) {
    orderedItem.index = index;

    index += 1;
  }

  return orderedItems;
};
