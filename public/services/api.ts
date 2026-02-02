/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStart } from 'opensearch-dashboards/public';
import {
  GetDocumentResponse,
  UpdateDocumentResponse,
  CatIndicesResponse,
  SearchDocumentsResponse,
  DeleteDocumentResponse,
} from '../types';
import { GET_DOCUMENT_ROUTE, UPDATE_DOCUMENT_ROUTE } from '../../common/constants';

/**
 * Props for getting indices
 */
export interface CatIndicesProps {
  http: HttpStart;
  dataSourceId?: string;
  search?: string;
  size?: number;
  nextToken?: string;
}

/**
 * Props for getting a document
 */
export interface GetDocumentProps {
  http: HttpStart;
  index: string;
  id: string;
  dataSourceId?: string;
}

/**
 * Props for updating a document
 */
export interface UpdateDocumentProps {
  http: HttpStart;
  index: string;
  id: string;
  document: Record<string, any>;
  dataSourceId?: string;
}

/**
 * Fetch a document from OpenSearch by index and ID
 * @param props GetDocumentProps
 * @returns GetDocumentResponse
 */
export async function getDocument({
  http,
  index,
  id,
  dataSourceId,
}: GetDocumentProps): Promise<GetDocumentResponse> {
  const query: Record<string, string> = {
    index,
    id,
  };

  if (dataSourceId) {
    query.dataSource = dataSourceId;
  }

  return await http.get<GetDocumentResponse>(GET_DOCUMENT_ROUTE, { query });
}

/**
 * Update a document in OpenSearch by index and ID
 * @param props UpdateDocumentProps
 * @returns UpdateDocumentResponse
 */
export async function updateDocument({
  http,
  index,
  id,
  document,
  dataSourceId,
}: UpdateDocumentProps): Promise<UpdateDocumentResponse> {
  const query: Record<string, string> = {
    index,
    id,
  };

  if (dataSourceId) {
    query.dataSource = dataSourceId;
  }

  return await http.put<UpdateDocumentResponse>(UPDATE_DOCUMENT_ROUTE, {
    query,
    body: JSON.stringify({ document }),
  });
}

/**
 * Fetch list of indices from OpenSearch using /_list/indices API
 * @param props CatIndicesProps
 * @returns CatIndicesResponse
 */
export async function catIndices({
  http,
  dataSourceId,
  search,
  size = 50,
  nextToken,
}: CatIndicesProps): Promise<CatIndicesResponse> {
  const query: Record<string, any> = {
    size,
  };

  if (dataSourceId) {
    query.dataSource = dataSourceId;
  }

  if (search) {
    query.search = search;
  }

  if (nextToken) {
    query.nextToken = nextToken;
  }

  return await http.get<CatIndicesResponse>('/api/document_editor/_cat_indices', {
    query,
  });
}

/**
 * Props for searching documents
 */
export interface SearchDocumentsProps {
  http: HttpStart;
  index: string;
  dataSourceId?: string;
  size?: number;
  from?: number;
}

/**
 * Search for documents in an index
 * @param props SearchDocumentsProps
 * @returns SearchDocumentsResponse
 */
export async function searchDocuments({
  http,
  index,
  dataSourceId,
  size = 100,
  from = 0,
}: SearchDocumentsProps): Promise<SearchDocumentsResponse> {
  const query: Record<string, any> = {
    index,
    size,
    from,
  };

  if (dataSourceId) {
    query.dataSource = dataSourceId;
  }

  return await http.get<SearchDocumentsResponse>('/api/document_editor/search', { query });
}

/**
 * Props for deleting a document
 */
export interface DeleteDocumentProps {
  http: HttpStart;
  index: string;
  id: string;
  dataSourceId?: string;
}

/**
 * Delete a document from OpenSearch by index and ID
 * @param props DeleteDocumentProps
 * @returns DeleteDocumentResponse
 */
export async function deleteDocument({
  http,
  index,
  id,
  dataSourceId,
}: DeleteDocumentProps): Promise<DeleteDocumentResponse> {
  const query: Record<string, string> = {
    index,
    id,
  };

  if (dataSourceId) {
    query.dataSource = dataSourceId;
  }

  return await http.delete<DeleteDocumentResponse>('/api/document_editor/document', { query });
}
