/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from '../../../src/core/public';
import { DocumentEditorPlugin } from './plugin';

/**
 * Public plugin initializer
 */
export function plugin(_initializerContext: PluginInitializerContext) {
  return new DocumentEditorPlugin();
}

export {
  DocumentEditorPluginSetup,
  DocumentEditorPluginStart,
  DocumentEditorPluginSetupDeps,
  DocumentEditorPluginStartDeps,
} from './types';
