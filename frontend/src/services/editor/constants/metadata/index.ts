import { dia } from 'jointjs';

export interface IFixedMetadataLink {
  index: number,
  url: string,
  type: string,
}

export interface IFixedMetadata {
  index: number,
  description: string,
  recommendation_type: string,
  intervention_type: string,
  intervention: string,
  comparator: string,
  direction: string,
  strength: string,
  certainty_of_the_evidence: string,
  implementation_considerations: string,
  additional_comments: string,
  recommendation_source: string,
  links: IFixedMetadataLink[],
  recommendationElementId?: dia.Cell.ID,
}
