/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginSetup } from '../../../src/plugins/data_source/server';

/**
 * Setup dependencies for the document editor plugin
 */
export interface DocumentEditorPluginSetupDeps {
  dataSource?: DataSourcePluginSetup;
}

/**
 * Start dependencies for the document editor plugin
 */
export interface DocumentEditorPluginStartDeps {}
