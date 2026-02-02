/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CoreSetup,
  CoreStart,
  Logger,
  Plugin,
  PluginInitializerContext,
} from 'opensearch-dashboards/server';
import { DocumentEditorPluginSetupDeps, DocumentEditorPluginStartDeps } from './types';
import { registerRoutes } from './routes';

/**
 * Document Editor Server Plugin
 * Provides API endpoints for fetching and updating documents in OpenSearch
 */
export class DocumentEditorPlugin
  implements Plugin<{}, {}, DocumentEditorPluginSetupDeps, DocumentEditorPluginStartDeps> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup, plugins: DocumentEditorPluginSetupDeps) {
    this.logger.info('Document Editor: Setup');

    const router = core.http.createRouter();

    // Check if data source plugin is enabled
    const dataSourceEnabled = !!plugins.dataSource;

    // Register all routes
    registerRoutes(router, dataSourceEnabled);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.info('Document Editor: Started');
    return {};
  }

  public stop() {
    this.logger.info('Document Editor: Stopped');
  }
}
