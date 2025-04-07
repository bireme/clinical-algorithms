export const HIGH = 'High';
export const MODERATE = 'Moderate';
export const LOW = 'Low';
export const VERY_LOW = 'Very Low';

export const CERTAINTY = {
  HIGH,
  MODERATE,
  LOW,
  VERY_LOW,
};

export const CERTAINTY_SPANISH: { [key: string]: string } = {
  [HIGH]: 'Alta',
  [MODERATE]: 'Moderada',
  [LOW]: 'Baja',
  [VERY_LOW]: 'Muy baja',
};

export function translateCertainty(value: string) {
  return CERTAINTY_SPANISH[value];
}

export function getCertaintyKey(value: string) {
  return [
    HIGH,
    MODERATE,
    LOW,
    VERY_LOW,
  ].find(
    (key) => CERTAINTY_SPANISH[key] === value,
  ) as string;
}
