import { DIRECTIONS, STRENGTH } from 'src/services/editor/constants';

export const getDirectionIcon = (
  direction: string,
  params?: { iconWidth?: number, labelSize?: number, lineHeight?: number },
) => {
  if (!direction) return '';

  let icon = '';

  icon += '<div class="text-center">';
  icon += `<img src="./icons/${direction}.svg" width="${params?.iconWidth || 24}" />`;
  icon += '</div>';
  icon += `<div class="full-width text-center q-mb-sm" style="font-size:${params?.labelSize || 11}px;line-height:${params?.lineHeight || 14}px">${
    DIRECTIONS.find((currentDirection) => currentDirection.value === direction)?.label
  }</div>`;

  return icon;
};

export const getStrengthIcon = (
  strength: string,
  params?: { iconWidth?: number, labelSize?: number, lineHeight?: number },
) => {
  if (!strength) return '';

  let icon = '';

  icon += '<div class="text-center">';
  icon += `<img src="./icons/${strength}.svg" width="${params?.iconWidth || 24}" />`;
  icon += '</div>';

  icon += `<div class="full-width text-center q-mb-sm" style="font-size:${params?.labelSize || 11}px;line-height:${params?.lineHeight || 14}px">${
    STRENGTH.find((currentStrength) => currentStrength.value === strength)?.label
  }</div>`;

  return icon;
};
