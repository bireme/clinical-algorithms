export const TREATMENT = 'Treatment';
export const DIAGNOSIS = 'Diagnosis';
export const POPULATION_CLASSIFICATION = 'Population classification';

export const INTERVENTION_TYPES = {
  TREATMENT,
  DIAGNOSIS,
  POPULATION_CLASSIFICATION,
};

export const INTERVENTION_TYPES_SPANISH: { [key: string]: string } = {
  [TREATMENT]: 'Tratamiento',
  [DIAGNOSIS]: 'Diagnóstico',
  [POPULATION_CLASSIFICATION]: 'Clasificación de la población',
};

export function translateInterventionType(type: string) {
  return INTERVENTION_TYPES_SPANISH[type] || '';
}

export function getInterventionTypeKey(value: string) {
  return [TREATMENT, DIAGNOSIS, POPULATION_CLASSIFICATION].find(
    (key) => INTERVENTION_TYPES_SPANISH[key] === value,
  ) as string || '';
}
