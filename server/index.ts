/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from 'opensearch-dashboards/server';
import { DocumentEditorPlugin } from './plugin';

/**
 * Server-side plugin initializer
 */
export function plugin(initializerContext: PluginInitializerContext) {
  return new DocumentEditorPlugin(initializerContext);
}

export { DocumentEditorPluginSetupDeps, DocumentEditorPluginStartDeps } from './types';
