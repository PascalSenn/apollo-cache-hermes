import { // eslint-disable-line import/no-extraneous-dependencies
  OperationTypeNode,
} from 'graphql';

import { ParsedQueryWithVariables, constructNestedQuery } from '../ParsedQueryNode';
import { RawOperation } from '../schema';
import {
  FragmentMap,
  fragmentMapForDocument,
  getOperationOrDie,
} from '../util';

import { BasicQueryInfo } from './BasicQueryInfo';
import { CacheContext } from './CacheContext';

/**
 * Metadata about a GraphQL document by dynamically created one
 * using given paths in the RawOperation to be used by writeFragment.
 *
 * This is different from SteaticQueryInfo in that we will use the paths
 * in RawOperation and construct the nestd ParsedQuery tree instead of
 * walking the given DocumentNode like the StaticQueryInfo
 *
 * We do a fair bit of pre-processing over them, and these objects hang onto
 * that information.
 */
export class DynamicQueryInfo implements BasicQueryInfo {
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

  constructor(context: CacheContext, raw: RawOperation) {
    this.operationType = 'query';
    this.fragmentMap = fragmentMapForDocument(raw.document);
    const { parsedQuery, variables } = constructNestedQuery(
      context,
      this.fragmentMap,
      getOperationOrDie(raw.document).selectionSet,
      raw.paths!,
      raw.fieldArguments,
    );
    this.parsed = parsedQuery;
    this.variables = variables;
  }
}