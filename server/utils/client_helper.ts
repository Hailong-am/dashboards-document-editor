/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestHandlerContext } from 'opensearch-dashboards/server';
import { OpenSearchClient } from '../../../../src/core/server/opensearch';

/**
 * Determines which OpenSearch client to use based on data source configuration
 * @param dataSourceEnabled Whether data source plugin is enabled
 * @param context Request handler context
 * @param dataSourceId Optional data source ID for multi-cluster support
 * @returns OpenSearch client instance
 */
export const decideClient = async (
  dataSourceEnabled: boolean,
  context: RequestHandlerContext,
  dataSourceId?: string
): Promise<OpenSearchClient> => {
  // If data source is enabled and ID is provided, use data source client
  if (dataSourceEnabled && dataSourceId) {
    return await context.dataSource.opensearch.getClient(dataSourceId);
  }

  // Otherwise use the default cluster client
  return context.core.opensearch.client.asCurrentUser;
};
