/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  EuiPanel,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiConfirmModal,
  EuiButton,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { HttpStart, NotificationsStart } from '../../../../../src/core/public';
import { DocumentItem } from '../types';
import { searchDocuments, deleteDocument } from '../services/api';

export interface DocumentTableViewProps {
  indexName: string;
  dataSourceId?: string;
  http: HttpStart;
  notifications: NotificationsStart;
  onEditDocument: (documentId: string) => void;
}

/**
 * Table view component for displaying documents in an index
 * Provides edit and delete actions for each document
 */
export const DocumentTableView: React.FC<DocumentTableViewProps> = ({
  indexName,
  dataSourceId,
  http,
  notifications,
  onEditDocument,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load documents from the index
   */
  const loadDocuments = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const result = await searchDocuments({
        http,
        index: indexName,
        dataSourceId,
        size: pageSize,
        from: pageIndex * pageSize,
      });

      if (!isMountedRef.current) return;

      setDocuments(result.documents);
      setTotal(result.total);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      notifications.toasts.addDanger({
        title: 'Failed to load documents',
        text: error.body?.message || error.message || 'An error occurred while loading documents',
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [http, indexName, dataSourceId, pageSize, pageIndex, notifications]);

  /**
   * Load documents when dependencies change
   */
  useEffect(() => {
    if (indexName) {
      loadDocuments();
    }
  }, [indexName, loadDocuments]);

  /**
   * Handle delete confirmation
   */
  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteModalVisible(true);
  };

  /**
   * Execute document deletion
   */
  const handleDeleteConfirm = async () => {
    if (!documentToDelete || !isMountedRef.current) return;

    try {
      await deleteDocument({
        http,
        index: indexName,
        id: documentToDelete,
        dataSourceId,
      });

      if (!isMountedRef.current) return;

      notifications.toasts.addSuccess({
        title: 'Document deleted',
        text: `Document ${documentToDelete} has been deleted`,
      });

      // Reload documents
      loadDocuments();
    } catch (error: any) {
      if (!isMountedRef.current) return;
      notifications.toasts.addDanger({
        title: 'Failed to delete document',
        text: error.body?.message || error.message || 'An error occurred while deleting the document',
      });
    } finally {
      if (isMountedRef.current) {
        setDeleteModalVisible(false);
        setDocumentToDelete(null);
      }
    }
  };

  /**
   * Cancel delete operation
   */
  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDocumentToDelete(null);
  };

  /**
   * Handle table pagination
   */
  const onTableChange = ({ page }: any) => {
    if (page) {
      setPageIndex(page.index);
      setPageSize(page.size);
    }
  };

  /**
   * Format source data for display (show first few fields)
   */
  const formatSource = (source: Record<string, any>): string => {
    const keys = Object.keys(source).slice(0, 3);
    const preview = keys.map((key) => {
      const value = source[key];
      const valueStr =
        typeof value === 'object' ? JSON.stringify(value).substring(0, 30) : String(value).substring(0, 30);
      return `${key}: ${valueStr}`;
    });
    return preview.join(', ') + (Object.keys(source).length > 3 ? '...' : '');
  };

  const columns: Array<EuiBasicTableColumn<DocumentItem>> = [
    {
      field: '_id',
      name: 'Document ID',
      width: '20%',
      truncateText: true,
    },
    {
      field: '_source',
      name: 'Source (Preview)',
      width: '50%',
      render: (source: Record<string, any>) => (
        <EuiText size="s" color="subdued">
          {formatSource(source)}
        </EuiText>
      ),
    },
    {
      field: '_version',
      name: 'Version',
      width: '10%',
    },
    {
      name: 'Actions',
      width: '20%',
      render: (item: DocumentItem) => (
        <EuiFlexGroup gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="documentEdit"
              aria-label="Edit document"
              color="primary"
              onClick={() => onEditDocument(item._id)}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="trash"
              aria-label="Delete document"
              color="danger"
              onClick={() => handleDeleteClick(item._id)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
  ];

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: total,
    pageSizeOptions: [10, 25, 50, 100],
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiText>
              <h3>Documents in {indexName}</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              iconType="refresh"
              onClick={loadDocuments}
              isLoading={isLoading}
              size="s"
            >
              Refresh
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        {isLoading && documents.length === 0 ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '200px' }}>
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <EuiBasicTable
            items={documents}
            columns={columns}
            pagination={pagination}
            onChange={onTableChange}
            loading={isLoading}
          />
        )}
      </EuiPanel>

      {deleteModalVisible && (
        <EuiConfirmModal
          title="Delete document"
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
        >
          <p>Are you sure you want to delete document {documentToDelete}?</p>
          <p>This action cannot be undone.</p>
        </EuiConfirmModal>
      )}
    </>
  );
};
