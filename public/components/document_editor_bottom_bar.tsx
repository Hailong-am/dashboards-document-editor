/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {
  EuiBottomBar,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiText,
} from '@elastic/eui';

export interface DocumentEditorBottomBarProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  hasValidationError: boolean;
}

/**
 * Bottom bar component for Save/Cancel controls
 * Appears when there are unsaved changes
 * Uses React Portal to render at bottom of page
 */
export const DocumentEditorBottomBar: React.FC<DocumentEditorBottomBarProps> = ({
  onSave,
  onCancel,
  isSaving,
  hasValidationError,
}) => {
  const bottomBar = (
    <EuiBottomBar position="sticky" data-test-subj="documentEditorBottomBar">
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiText size="s">
            <p>You have unsaved changes</p>
          </EuiText>
        </EuiFlexItem>

        <EuiFlexItem />

        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            color="ghost"
            size="s"
            onClick={onCancel}
            disabled={isSaving}
            data-test-subj="documentEditorCancelButton"
          >
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButton
            color="primary"
            fill
            size="s"
            onClick={onSave}
            isLoading={isSaving}
            disabled={hasValidationError || isSaving}
            data-test-subj="documentEditorSaveButton"
          >
            Save
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiBottomBar>
  );

  // Render bottom bar in a portal at the body level
  const appWrapper = document.getElementById('app-wrapper');
  return appWrapper ? ReactDOM.createPortal(bottomBar, appWrapper) : bottomBar;
};
