import {
  CONDITIONAL_RECOMMENDATION,
  STRONG_RECOMMENDATION,
} from 'src/services/editor/constants/metadata/recommendation_strength';

import {
  AGAINST_THE_INTERVENTION,
  BOTH,
  IN_FAVOR_OF_THE_INTERVENTION,
} from 'src/services/editor/constants/metadata/direction';

import { IFixedMetadata } from 'src/services/editor/constants/metadata';

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

export const recommendationArrowsLine = (recommendation: IFixedMetadata) => {
  let items = '';

  items += '<div class="col-4 flex items-center text-caption q-pa-sm">';
  items += recommendation.comparator;
  items += '</div>';

  items += '<div class="col-4 flex items-center justify-center">';
  items += `<img
        src="${recommendationArrowsImage(recommendation)}"
        alt=""
      />`;
  items += '</div>';

  items += '<div class="col-4 flex items-center text-caption q-pa-sm">';
  items += recommendation.intervention;
  items += '</div>';

  return items;
};
