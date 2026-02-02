/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { DocumentEditorApp } from '../components/document_editor_app';
import { DocumentEditorPluginStartDeps, DocumentEditorPluginSetupDeps } from '../types';
import { AppMountParameters, CoreStart } from '../../../../src/core/public';

/**
 * Render the Document Editor application
 * @param core CoreStart services
 * @param pluginsStart Plugin start dependencies
 * @param params AppMountParameters including element and basename
 * @param pluginsSetup Plugin setup dependencies (contains dataSourceManagement)
 * @returns Unmount function
 */
export const renderApp = (
  core: CoreStart,
  pluginsStart: DocumentEditorPluginStartDeps,
  params: AppMountParameters,
  pluginsSetup: DocumentEditorPluginSetupDeps
) => {
  ReactDOM.render(
    <DocumentEditorApp
      basename={params.appBasePath}
      notifications={core.notifications}
      http={core.http}
      navigation={pluginsStart.navigation}
      savedObjects={core.savedObjects}
      dataSourceEnabled={!!pluginsSetup.dataSource}
      dataSourceManagement={pluginsSetup.dataSourceManagement}
    />,
    params.element
  );

  return () => ReactDOM.unmountComponentAtNode(params.element);
};
