/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { decideClient } from '../utils/client_helper';

/**
 * Register route to fetch indices from OpenSearch using _cat/indices API
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerCatIndicesRoute(router: IRouter, dataSourceEnabled: boolean) {
  router.get(
    {
      path: '/api/document_editor/_cat_indices',
      validate: {
        query: schema.object({
          dataSource: schema.maybe(schema.string()),
          search: schema.maybe(schema.string()),
          size: schema.maybe(schema.number({ min: 1, max: 10000 })),
          nextToken: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      const { dataSource, search, size = 50, nextToken } = request.query;
      const client = await decideClient(dataSourceEnabled, context, dataSource);

      if (!client) {
        return response.notFound({
          body: { message: 'Data source is not enabled or does not exist' },
        });
      }

      try {
        // Use index pattern if search is provided, otherwise get all indices
        const indexPattern = search ? `${search}*` : '*';

        // Use _cat/indices API which is more reliable for pattern matching
        const result = await client.cat.indices({
          index: indexPattern,
          format: 'json',
          h: 'index',
        });

        // Extract index names from response
        const indices = result.body || [];
        const indexNames = indices
          .map((index: any) => index.index)
          .filter((name: string) => name !== undefined)
          .sort();

        // Apply size limit (simple pagination without nextToken)
        const limitedIndices = indexNames.slice(0, size);

        return response.ok({
          body: {
            indices: limitedIndices,
            nextToken: undefined, // _cat/indices doesn't support pagination tokens
          },
        });
      } catch (error) {
        // If the search pattern doesn't match any indices, return empty array
        if (error.statusCode === 404 || error.body?.error?.type === 'index_not_found_exception') {
          return response.ok({
            body: {
              indices: [],
              nextToken: undefined,
            },
          });
        }

        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: `Error when listing indices: ${error.message}`,
          },
        });
      }
    }
  );
}
