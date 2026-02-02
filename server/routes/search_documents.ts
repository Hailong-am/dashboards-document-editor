/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from 'opensearch-dashboards/server';
import { decideClient } from '../utils/client_helper';

/**
 * Register GET route for searching documents in an index
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerSearchDocumentsRoute(
  router: IRouter,
  dataSourceEnabled: boolean
) {
  router.get(
    {
      path: '/api/document_editor/search',
      validate: {
        query: schema.object({
          index: schema.string({ minLength: 1 }),
          dataSource: schema.maybe(schema.string()),
          size: schema.maybe(schema.number({ min: 1, max: 10000 })),
          from: schema.maybe(schema.number({ min: 0 })),
        }),
      },
    },
    async (context, request, response) => {
      const { index, dataSource, size = 100, from = 0 } = request.query;

      try {
        const client = await decideClient(dataSourceEnabled, context, dataSource);

        if (!client) {
          return response.notFound({
            body: { message: 'Data source is not enabled or does not exist' },
          });
        }

        // Search for documents in the index
        const result = await client.search({
          index,
          body: {
            query: {
              match_all: {},
            },
            size,
            from,
          },
        });

        // Extract documents with their metadata
        const documents = result.body.hits.hits.map((hit: any) => ({
          _id: hit._id,
          _index: hit._index,
          _source: hit._source,
          _version: hit._version,
          _seq_no: hit._seq_no,
          _primary_term: hit._primary_term,
        }));

        return response.ok({
          body: {
            documents,
            total: result.body.hits.total.value,
          },
        });
      } catch (error) {
        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: error.message || 'An error occurred while searching documents',
          },
        });
      }
    }
  );
}
