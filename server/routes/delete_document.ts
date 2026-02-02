/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter } from 'opensearch-dashboards/server';
import { decideClient } from '../utils/client_helper';

/**
 * Register DELETE route for deleting a document by index and ID
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerDeleteDocumentRoute(
  router: IRouter,
  dataSourceEnabled: boolean
) {
  router.delete(
    {
      path: '/api/document_editor/document',
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
        const client = await decideClient(dataSourceEnabled, context, dataSource);

        if (!client) {
          return response.notFound({
            body: { message: 'Data source is not enabled or does not exist' },
          });
        }

        // Delete the document
        const result = await client.delete({
          index,
          id,
        });

        return response.ok({
          body: {
            success: true,
            result: result.body.result,
          },
        });
      } catch (error) {
        // Handle 404 - document not found
        if (error.statusCode === 404) {
          return response.notFound({
            body: {
              message: 'Document not found',
            },
          });
        }

        return response.customError({
          statusCode: error.statusCode || 500,
          body: {
            message: error.message || 'An error occurred while deleting the document',
          },
        });
      }
    }
  );
}
