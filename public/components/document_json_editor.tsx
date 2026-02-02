/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiBadge,
  EuiSpacer,
  EuiFormRow,
  EuiCodeEditor,
  EuiLoadingSpinner,
  EuiOverlayMask,
} from '@elastic/eui';

export interface DocumentJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  readOnly: boolean;
  error?: string;
  documentVersion?: number;
  documentSeqNo?: number;
  documentPrimaryTerm?: number;
}

/**
 * JSON editor component for editing document content
 * Uses EuiCodeEditor in JSON mode with syntax highlighting and validation
 */
export const DocumentJsonEditor: React.FC<DocumentJsonEditorProps> = ({
  value,
  onChange,
  isLoading,
  readOnly,
  error,
  documentVersion,
  documentSeqNo,
  documentPrimaryTerm,
}) => {
  return (
    <EuiPanel>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h3>Document Content</h3>
          </EuiTitle>
        </EuiFlexItem>
        {documentVersion !== undefined && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiBadge color="hollow">Version: {documentVersion}</EuiBadge>
              </EuiFlexItem>
              {documentSeqNo !== undefined && (
                <EuiFlexItem grow={false}>
                  <EuiBadge color="hollow">Seq No: {documentSeqNo}</EuiBadge>
                </EuiFlexItem>
              )}
              {documentPrimaryTerm !== undefined && (
                <EuiFlexItem grow={false}>
                  <EuiBadge color="hollow">Primary Term: {documentPrimaryTerm}</EuiBadge>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      <EuiFormRow fullWidth isInvalid={!!error} error={error}>
        <div style={{ position: 'relative' }}>
          {isLoading && (
            <EuiOverlayMask>
              <EuiLoadingSpinner size="xl" />
            </EuiOverlayMask>
          )}
          <EuiCodeEditor
            mode="json"
            theme="textmate"
            width="100%"
            height="600px"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false,
              showPrintMargin: false,
            }}
            editorProps={{
              $blockScrolling: Infinity,
            }}
            aria-label="Document JSON editor"
          />
        </div>
      </EuiFormRow>
    </EuiPanel>
  );
};
