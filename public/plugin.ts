/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DocumentEditorPluginSetup,
  DocumentEditorPluginStart,
  DocumentEditorPluginSetupDeps,
  DocumentEditorPluginStartDeps,
} from './types';
import { PLUGIN_ID, PLUGIN_NAME } from '../common/constants';
import { AppMountParameters, CoreSetup, CoreStart, DEFAULT_APP_CATEGORIES, DEFAULT_NAV_GROUPS, Plugin, WorkspaceAvailability } from '../../../src/core/public';

/**
 * Document Editor Public Plugin
 * Registers the application and provides client-side functionality
 */
export class DocumentEditorPlugin
  implements
    Plugin<
      DocumentEditorPluginSetup,
      DocumentEditorPluginStart,
      DocumentEditorPluginSetupDeps,
      DocumentEditorPluginStartDeps
    > {

  public setup(
    core: CoreSetup<DocumentEditorPluginStartDeps>,
    plugins: DocumentEditorPluginSetupDeps
  ): DocumentEditorPluginSetup {

    // Register the application
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      description: 'Edit documents in OpenSearch indices',
      workspaceAvailability: WorkspaceAvailability.outsideWorkspace,
      async mount(params: AppMountParameters) {
        // Lazy load the application to reduce initial bundle size
        const { renderApp } = await import('./application');
        const [coreStart, pluginsStart] = await core.getStartServices();
        return renderApp(coreStart, pluginsStart, params, plugins);
      },
    });

    // Add to left navigation in Data Administration group
    core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.dataAdministration, [
      {
        id: PLUGIN_ID,
        category: DEFAULT_APP_CATEGORIES.manageData,
        order: 500,
      },
    ]);

    return {};
  }

  public start(core: CoreStart, plugins: DocumentEditorPluginStartDeps): DocumentEditorPluginStart {
    return {};
  }

  public stop() {}
}
