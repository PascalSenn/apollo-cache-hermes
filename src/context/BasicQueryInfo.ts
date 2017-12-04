import { OperationTypeNode } from 'graphql';  // eslint-disable-line import/no-extraneous-dependencies

import { ParsedQueryWithVariables } from '../ParsedQueryNode';
import {
  FragmentMap,
} from '../util';

export interface BasicQueryInfo {
  /** The type of operation. */
  readonly operationType: OperationTypeNode;

  /** All fragments in the document, indexed by name. */
  readonly fragmentMap: FragmentMap;
  /**
   * The fully parsed query document.  It will be flattened (no fragments),
   * and contain placeholders for any variables in use.
   */
  readonly parsed: ParsedQueryWithVariables;
  /** Variables used within this query. */
  readonly variables: Set<string>;
}