/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginSetup } from '../../../src/plugins/data_source/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

/**
 * Setup dependencies for the document editor plugin
 */
export interface DocumentEditorPluginSetupDeps {
  dataSource?: DataSourcePluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

/**
 * Start dependencies for the document editor plugin
 */
export interface DocumentEditorPluginStartDeps {
  navigation: NavigationPublicPluginStart;
  dataSource?: DataSourcePluginSetup;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

/**
 * Setup contract for the document editor plugin
 */
export interface DocumentEditorPluginSetup {}

/**
 * Start contract for the document editor plugin
 */
export interface DocumentEditorPluginStart {}

/**
 * Response from GET document API
 */
export interface GetDocumentResponse {
  found: boolean;
  _source?: Record<string, any>;
  _version?: number;
  _seq_no?: number;
  _primary_term?: number;
}

/**
 * Response from UPDATE document API
 */
export interface UpdateDocumentResponse {
  success: boolean;
  _version: number;
  _seq_no: number;
  _primary_term: number;
}

/**
 * Response from cat indices API (using /_list/indices)
 */
export interface CatIndicesResponse {
  indices: string[];
  nextToken?: string;
}

/**
 * Document item in search results
 */
export interface DocumentItem {
  _id: string;
  _index: string;
  _source: Record<string, any>;
  _version: number;
  _seq_no: number;
  _primary_term: number;
}

/**
 * Response from search documents API
 */
export interface SearchDocumentsResponse {
  documents: DocumentItem[];
  total: number;
}

/**
 * Response from delete document API
 */
export interface DeleteDocumentResponse {
  success: boolean;
  result: string;
}
