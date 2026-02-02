/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from 'opensearch-dashboards/server';
import { GET_DOCUMENT_ROUTE } from '../../common/constants';
import { decideClient } from '../utils/client_helper';

/**
 * Register GET route for fetching a document by index and ID
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerGetDocumentRoute(
  router: IRouter,
  dataSourceEnabled: boolean
) {
  router.get(
    {
      path: GET_DOCUMENT_ROUTE,
      validate: {
        query: schema.object({
          index: schema.string({ minLength: 1 }),
          id: schema.string({ minLength: 1 }),
          dataSource: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      const { index, id, dataSource } = request.query;

      try {
        // Get the appropriate OpenSearch client
        const client = await decideClient(dataSourceEnabled, context, dataSource);

        if (!client) {
          return response.notFound({
            body: { message: 'Data source is not enabled or does not exist' },
          });
        }

        // Fetch the document from OpenSearch
        const result = await client.get({
          index,
          id,
        });

        // Return the document if found
        return response.ok({
          body: {
            found: true,
            _source: result.body._source,
            _version: result.body._version,
            _seq_no: result.body._seq_no,
            _primary_term: result.body._primary_term,
          },
        });
      } catch (error) {
        // Handle 404 - document not found
        if (error.statusCode === 404) {
          return response.ok({
            body: { found: false },
          });
        }

        // Handle other errors
        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: error.message || 'An error occurred while fetching the document',
          },
        });
      }
    }
  );
}
