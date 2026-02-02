/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from 'opensearch-dashboards/server';
import { UPDATE_DOCUMENT_ROUTE } from '../../common/constants';
import { decideClient } from '../utils/client_helper';

/**
 * Register PUT route for updating a document by index and ID
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerUpdateDocumentRoute(
  router: IRouter,
  dataSourceEnabled: boolean
) {
  router.put(
    {
      path: UPDATE_DOCUMENT_ROUTE,
      validate: {
        query: schema.object({
          index: schema.string({ minLength: 1 }),
          id: schema.string({ minLength: 1 }),
          dataSource: schema.maybe(schema.string()),
        }),
        body: schema.object({
          document: schema.any(),
        }),
      },
    },
    async (context, request, response) => {
      const { index, id, dataSource } = request.query;
      const { document } = request.body;

      try {
        // Get the appropriate OpenSearch client
        const client = await decideClient(dataSourceEnabled, context, dataSource);

        if (!client) {
          return response.notFound({
            body: { message: 'Data source is not enabled or does not exist' },
          });
        }

        // Index the document (replaces existing document)
        const result = await client.index({
          index,
          id,
          body: document,
        });

        // Return success with new version
        return response.ok({
          body: {
            success: true,
            _version: result.body._version,
            _seq_no: result.body._seq_no,
            _primary_term: result.body._primary_term,
          },
        });
      } catch (error) {
        // Handle errors
        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: error.message || 'An error occurred while updating the document',
          },
        });
      }
    }
  );
}
