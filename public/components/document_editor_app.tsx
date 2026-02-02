/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageContent,
  EuiTitle,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';
import { CoreStart, NotificationsStart, HttpStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import {
  DataSourceManagementPluginSetup,
  DataSourceOption,
} from '../../../../src/plugins/data_source_management/public';
import { DocumentSearchForm } from './document_search_form';
import { DocumentJsonEditor } from './document_json_editor';
import { DocumentEditorBottomBar } from './document_editor_bottom_bar';
import { DocumentTableView } from './document_table_view';
import { getDocument, updateDocument, catIndices } from '../services/api';

export interface DocumentEditorAppProps {
  basename: string;
  notifications: NotificationsStart;
  http: HttpStart;
  navigation: NavigationPublicPluginStart;
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

/**
 * Main Document Editor Application Component
 * Manages state and coordinates between child components
 */
export const DocumentEditorApp: React.FC<DocumentEditorAppProps> = ({
  basename,
  notifications,
  http,
  navigation,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
}) => {
  // Form inputs
  const [indexName, setIndexName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [dataSourceId, setDataSourceId] = useState<string | undefined>();
  const [indexOptions, setIndexOptions] = useState<Array<{ label: string }>>([]);

  // Document data
  const [originalDocument, setOriginalDocument] = useState('');
  const [editedDocument, setEditedDocument] = useState('');
  const [documentVersion, setDocumentVersion] = useState<number>();
  const [documentSeqNo, setDocumentSeqNo] = useState<number>();
  const [documentPrimaryTerm, setDocumentPrimaryTerm] = useState<number>();

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentFound, setDocumentFound] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'table'>('single');
  const [isLoadingIndices, setIsLoadingIndices] = useState(false);

  // Validation
  const [jsonValidationError, setJsonValidationError] = useState<string>();

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Compute if there are unsaved changes
  const hasUnsavedChanges = useMemo(
    () => originalDocument !== editedDocument && documentFound,
    [originalDocument, editedDocument, documentFound]
  );

  // Check if index is a system index
  const isSystemIndex = useMemo(() => {
    return indexName.startsWith('.');
  }, [indexName]);

  /**
   * Data source selection handler
   */
  const onDataSourceSelect = useCallback((newDataSource: DataSourceOption[]) => {
    if (newDataSource.length > 0) {
      setDataSourceId(newDataSource[0].id);
    }
  }, []);

  /**
   * Handle editing a document from table view
   */
  const handleEditFromTable = useCallback(async (documentId: string) => {
    if (!isMountedRef.current) return;

    setDocumentId(documentId);
    setViewMode('single');

    // Load the document
    setIsLoading(true);
    setJsonValidationError(undefined);

    try {
      const result = await getDocument({
        http,
        index: indexName,
        id: documentId,
        dataSourceId,
      });

      if (!isMountedRef.current) return;

      if (result.found && result._source) {
        const formatted = JSON.stringify(result._source, null, 2);
        setOriginalDocument(formatted);
        setEditedDocument(formatted);
        setDocumentVersion(result._version);
        setDocumentSeqNo(result._seq_no);
        setDocumentPrimaryTerm(result._primary_term);
        setDocumentFound(true);

        notifications.toasts.addSuccess({
          title: 'Document loaded successfully',
          text: `Loaded document from index "${indexName}"`,
        });
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      notifications.toasts.addDanger({
        title: 'Failed to load document',
        text: err.body?.message || err.message || 'An error occurred while loading the document',
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [http, indexName, dataSourceId, notifications]);

  /**
   * Load document from OpenSearch
   */
  const loadDocument = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setJsonValidationError(undefined);

    try {
      const result = await getDocument({
        http,
        index: indexName,
        id: documentId,
        dataSourceId,
      });

      if (!isMountedRef.current) return;

      if (result.found && result._source) {
        const formatted = JSON.stringify(result._source, null, 2);
        setOriginalDocument(formatted);
        setEditedDocument(formatted);
        setDocumentVersion(result._version);
        setDocumentSeqNo(result._seq_no);
        setDocumentPrimaryTerm(result._primary_term);
        setDocumentFound(true);

        notifications.toasts.addSuccess({
          title: 'Document loaded successfully',
          text: `Loaded document from index "${indexName}"`,
        });
      } else {
        setDocumentFound(false);
        setOriginalDocument('');
        setEditedDocument('');
        setDocumentVersion(undefined);
        setDocumentSeqNo(undefined);
        setDocumentPrimaryTerm(undefined);

        notifications.toasts.addWarning({
          title: 'Document not found',
          text: `No document with ID "${documentId}" found in index "${indexName}"`,
        });
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setDocumentFound(false);
      notifications.toasts.addDanger({
        title: 'Failed to load document',
        text: err.body?.message || err.message || 'An error occurred while loading the document',
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  /**
   * Save document to OpenSearch
   */
  const saveDocument = async () => {
    if (!isMountedRef.current) return;

    // Validate JSON before saving
    try {
      JSON.parse(editedDocument);
    } catch (e) {
      setJsonValidationError('Invalid JSON format');
      return;
    }

    setIsSaving(true);

    try {
      const document = JSON.parse(editedDocument);
      const result = await updateDocument({
        http,
        index: indexName,
        id: documentId,
        document,
        dataSourceId,
      });

      if (!isMountedRef.current) return;

      setOriginalDocument(editedDocument);
      setDocumentVersion(result._version);
      setDocumentSeqNo(result._seq_no);
      setDocumentPrimaryTerm(result._primary_term);

      notifications.toasts.addSuccess({
        title: 'Document saved successfully',
        text: `Version: ${result._version}, Seq No: ${result._seq_no}`,
      });
    } catch (err: any) {
      if (!isMountedRef.current) return;
      notifications.toasts.addDanger({
        title: 'Failed to save document',
        text: err.body?.message || err.message || 'An error occurred while saving the document',
      });
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  /**
   * Cancel editing and revert changes
   */
  const cancelEdit = () => {
    setEditedDocument(originalDocument);
    setJsonValidationError(undefined);
  };

  /**
   * Handle editor content change with validation
   */
  const onEditorChange = useCallback((value: string) => {
    setEditedDocument(value);
    setJsonValidationError(undefined);

    // Debounced validation
    setTimeout(() => {
      try {
        JSON.parse(value);
      } catch (e) {
        setJsonValidationError('Invalid JSON format');
      }
    }, 300);
  }, []);

  /**
   * Warn user before leaving page with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * Fetch all system indices (starting with .)
   */
  const fetchSystemIndices = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoadingIndices(true);
    try {
      // Fetch all system indices by searching for indices starting with '.'
      const response = await catIndices({ http, dataSourceId, search: '.', size: 1000 });
      if (!isMountedRef.current) return;

      // Cache all system indices
      const allIndices = response.indices.map((index: string) => ({ label: index }));
      setIndexOptions(allIndices);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      notifications.toasts.addDanger({
        title: 'Failed to fetch system indices',
        text: error.body?.message || error.message || 'An error occurred while fetching indices',
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoadingIndices(false);
      }
    }
  }, [http, dataSourceId, notifications]);

  /**
   * Load system indices on mount and when data source changes
   */
  useEffect(() => {
    fetchSystemIndices();
  }, [fetchSystemIndices]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Switch to table view when system index is selected
   */
  useEffect(() => {
    if (indexName && isSystemIndex && viewMode === 'single' && !documentId) {
      setViewMode('table');
    }
  }, [indexName, isSystemIndex, viewMode, documentId]);

  /**
   * Render data source selector component
   */
  const renderDataSourceComponent = useMemo(() => {
    if (!dataSourceEnabled || !dataSourceManagement || !dataSourceManagement.ui || !dataSourceManagement.ui.DataSourceSelector) {
      return null;
    }

    const DataSourceSelector = dataSourceManagement.ui.DataSourceSelector as React.ComponentType<any>;
    return (
      <DataSourceSelector
        savedObjectsClient={savedObjects.client}
        notifications={notifications.toasts}
        onSelectedDataSource={onDataSourceSelect}
        disabled={false}
        fullWidth={false}
        compressed={false}
      />
    );
  }, [dataSourceEnabled, dataSourceManagement, savedObjects.client, notifications, onDataSourceSelect]);

  return (
    <Router basename={basename}>
      <I18nProvider>
        <navigation.ui.TopNavMenu />
        <EuiPage>
          <EuiPageBody>
            <EuiPageHeader>
              <EuiTitle size="l">
                <h1>Document Editor</h1>
              </EuiTitle>
            </EuiPageHeader>

            <EuiPageContent>
              {dataSourceEnabled && (
                <>
                  <EuiTitle size="xs">
                    <span>Select data source</span>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  {renderDataSourceComponent}
                  <EuiSpacer size="l" />
                </>
              )}

              {viewMode === 'table' && isSystemIndex ? (
                <>
                  <DocumentSearchForm
                    indexName={indexName}
                    documentId=""
                    indexOptions={indexOptions}
                    onIndexNameChange={setIndexName}
                    onDocumentIdChange={() => {}}
                    onLoadDocument={() => {}}
                    isLoading={isLoading}
                    isLoadingIndices={isLoadingIndices}
                    disabled={true}
                  />
                  <EuiSpacer size="l" />
                  {indexName && (
                    <DocumentTableView
                      indexName={indexName}
                      dataSourceId={dataSourceId}
                      http={http}
                      notifications={notifications}
                      onEditDocument={handleEditFromTable}
                    />
                  )}
                </>
              ) : (
                <>
                  {isSystemIndex && documentId && (
                    <>
                      <EuiButton
                        iconType="arrowLeft"
                        size="s"
                        onClick={() => {
                          setViewMode('table');
                          setDocumentId('');
                          setDocumentFound(false);
                          setOriginalDocument('');
                          setEditedDocument('');
                        }}
                      >
                        Back to table view
                      </EuiButton>
                      <EuiSpacer size="m" />
                    </>
                  )}
                  <DocumentSearchForm
                    indexName={indexName}
                    documentId={documentId}
                    indexOptions={indexOptions}
                    onIndexNameChange={setIndexName}
                    onDocumentIdChange={setDocumentId}
                    onLoadDocument={loadDocument}
                    isLoading={isLoading}
                    isLoadingIndices={isLoadingIndices}
                    disabled={!indexName || !documentId || isLoading}
                  />

                  <EuiSpacer size="l" />

                  <DocumentJsonEditor
                    value={editedDocument}
                    onChange={onEditorChange}
                    isLoading={isLoading}
                    readOnly={!documentFound}
                    error={jsonValidationError}
                    documentVersion={documentVersion}
                    documentSeqNo={documentSeqNo}
                    documentPrimaryTerm={documentPrimaryTerm}
                  />
                </>
              )}
            </EuiPageContent>

            {hasUnsavedChanges && (
              <DocumentEditorBottomBar
                onSave={saveDocument}
                onCancel={cancelEdit}
                isSaving={isSaving}
                hasValidationError={!!jsonValidationError}
              />
            )}
          </EuiPageBody>
        </EuiPage>
      </I18nProvider>
    </Router>
  );
};
