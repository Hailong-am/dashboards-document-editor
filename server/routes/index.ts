/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { registerGetDocumentRoute } from './get_document';
import { registerUpdateDocumentRoute } from './update_document';
import { registerCatIndicesRoute } from './cat_indices';
import { registerSearchDocumentsRoute } from './search_documents';
import { registerDeleteDocumentRoute } from './delete_document';

/**
 * Register all routes for the document editor plugin
 * @param router IRouter instance
 * @param dataSourceEnabled Whether data source plugin is enabled
 */
export function registerRoutes(router: IRouter, dataSourceEnabled: boolean) {
  registerGetDocumentRoute(router, dataSourceEnabled);
  registerUpdateDocumentRoute(router, dataSourceEnabled);
  registerCatIndicesRoute(router, dataSourceEnabled);
  registerSearchDocumentsRoute(router, dataSourceEnabled);
  registerDeleteDocumentRoute(router, dataSourceEnabled);
}
