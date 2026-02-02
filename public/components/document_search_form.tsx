/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';

export interface DocumentSearchFormProps {
  indexName: string;
  documentId: string;
  indexOptions: Array<{ label: string }>;
  onIndexNameChange: (value: string) => void;
  onDocumentIdChange: (value: string) => void;
  onLoadDocument: () => void;
  isLoading: boolean;
  isLoadingIndices?: boolean;
  disabled: boolean;
}

/**
 * Form component for entering index name and document ID
 * Provides inputs and a button to load the document
 */
export const DocumentSearchForm: React.FC<DocumentSearchFormProps> = ({
  indexName,
  documentId,
  indexOptions,
  onIndexNameChange,
  onDocumentIdChange,
  onLoadDocument,
  isLoading,
  isLoadingIndices = false,
  disabled,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      onLoadDocument();
    }
  };

  const handleIndexChange = (selected: Array<{ label: string }>) => {
    if (selected.length > 0) {
      onIndexNameChange(selected[0].label);
    } else {
      onIndexNameChange('');
    }
  };

  const handleCreateOption = (searchValue: string) => {
    onIndexNameChange(searchValue);
  };

  const selectedIndexOptions = indexName ? [{ label: indexName }] : [];

  return (
    <EuiPanel>
      <EuiForm>
        <EuiFormRow
          label="Index Name"
          helpText={
            isLoadingIndices
              ? "Loading indices..."
              : `${indexOptions.length} ${indexOptions.length === 1 ? 'index' : 'indices'} available. Type to filter or enter custom name.`
          }
          fullWidth
        >
          <EuiComboBox
            placeholder="Select or enter index name"
            singleSelection={{ asPlainText: true }}
            options={indexOptions}
            selectedOptions={selectedIndexOptions}
            onChange={handleIndexChange}
            onCreateOption={handleCreateOption}
            isDisabled={isLoading}
            isLoading={isLoadingIndices}
            data-test-subj="documentEditorIndexInput"
            fullWidth
          />
        </EuiFormRow>

        <EuiFormRow
          label="Document ID"
          helpText="Enter the unique document identifier"
          fullWidth
        >
          <EuiFieldText
            placeholder="Enter document ID"
            value={documentId}
            onChange={(e) => onDocumentIdChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            data-test-subj="documentEditorIdInput"
            fullWidth
          />
        </EuiFormRow>

        <EuiSpacer size="m" />

        <EuiFormRow>
          <EuiButton
            onClick={onLoadDocument}
            disabled={disabled}
            isLoading={isLoading}
            fill
            data-test-subj="documentEditorLoadButton"
          >
            Load Document
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </EuiPanel>
  );
};
