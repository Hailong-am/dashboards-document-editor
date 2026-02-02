# OpenSearch Dashboards Document Editor

A plugin for OpenSearch Dashboards that provides a user-friendly interface to view, edit, and delete documents in OpenSearch indices.

## Features

- **Document Search & Edit**: Search for documents by index name and document ID, view and edit document content in a JSON editor
- **System Index Table View**: Browse system indices (indices starting with `.`) in a table view with pagination
- **Document Management**: Edit and delete documents directly from the UI
- **Multi-Cluster Support**: Full support for data source management across multiple OpenSearch clusters
- **Metadata Display**: View document version, sequence number, and primary term information
- **JSON Validation**: Real-time JSON syntax validation with inline error messages
- **Unsaved Changes Protection**: Warns users before leaving the page with unsaved changes

## Installation

This plugin is an external plugin for OpenSearch Dashboards. Follow these steps to install:

### Prerequisites

- Node.js (version specified in `.nvmrc` of OpenSearch Dashboards)
- Yarn 1.22.19 or later
- OpenSearch Dashboards 3.5.0 or compatible version

### Setup

1. Clone or copy this plugin into the `plugins` directory of your OpenSearch Dashboards installation:
   ```bash
   cd /path/to/OpenSearch-Dashboards/plugins
   git clone <repository-url> dashboards-document-editor
   ```

2. Bootstrap the plugin:
   ```bash
   cd /path/to/OpenSearch-Dashboards
   yarn osd bootstrap --single-version=loose
   ```

3. Start OpenSearch Dashboards:
   ```bash
   yarn start
   ```

4. Navigate to the Document Editor from the left navigation menu under **Data Administration** > **Document Editor**

## Usage

### Single Document Edit Mode

1. Select or enter an index name
2. Enter a document ID
3. Click **Load Document**
4. Edit the JSON content in the editor
5. Click **Save** to persist changes or **Cancel** to discard

### System Index Table View

For system indices (starting with `.`):

1. Select a system index from the dropdown
2. The table view automatically displays all documents in the index
3. Use the pagination controls to navigate through documents
4. Click the **Edit** icon to edit a specific document
5. Click the **Delete** icon to remove a document (with confirmation)

### Multi-Cluster Support

If data source management is enabled:

1. Select a data source from the data source picker at the top
2. All operations (load, save, delete, search) will be performed on the selected cluster

## API Endpoints

The plugin exposes the following REST API endpoints:

### Get Document
```
GET /api/document_editor/document
Query Parameters:
  - index (string, required): Index name
  - id (string, required): Document ID
  - dataSource (string, optional): Data source ID for multi-cluster
```

### Update Document
```
PUT /api/document_editor/document
Query Parameters:
  - index (string, required): Index name
  - id (string, required): Document ID
  - dataSource (string, optional): Data source ID
Body:
  - document (object): The updated document content
```

### Delete Document
```
DELETE /api/document_editor/document
Query Parameters:
  - index (string, required): Index name
  - id (string, required): Document ID
  - dataSource (string, optional): Data source ID
```

### List Indices
```
GET /api/document_editor/_cat_indices
Query Parameters:
  - search (string, optional): Index pattern to search (e.g., "." for system indices)
  - size (number, optional): Maximum number of indices to return (default: 50, max: 10000)
  - dataSource (string, optional): Data source ID
```

### Search Documents
```
GET /api/document_editor/search
Query Parameters:
  - index (string, required): Index name
  - size (number, optional): Number of documents to return (default: 100)
  - from (number, optional): Starting offset for pagination (default: 0)
  - dataSource (string, optional): Data source ID
```

## Development

### Project Structure

```
dashboards-document-editor/
├── common/
│   ├── constants.ts              # Shared constants
│   └── index.ts
├── server/
│   ├── index.ts                  # Server plugin export
│   ├── plugin.ts                 # Server plugin class
│   ├── types.ts                  # Server-side types
│   ├── routes/
│   │   ├── index.ts              # Route registration
│   │   ├── get_document.ts       # GET document endpoint
│   │   ├── update_document.ts    # PUT document endpoint
│   │   ├── delete_document.ts    # DELETE document endpoint
│   │   ├── cat_indices.ts        # List indices endpoint
│   │   └── search_documents.ts   # Search documents endpoint
│   └── utils/
│       └── client_helper.ts      # Data source client resolver
└── public/
    ├── index.ts                  # Public plugin export
    ├── plugin.ts                 # Client plugin class
    ├── types.ts                  # Client-side types
    ├── application/
    │   └── index.tsx             # Application mount point
    ├── components/
    │   ├── document_editor_app.tsx          # Main app component
    │   ├── document_search_form.tsx         # Index/ID input form
    │   ├── document_json_editor.tsx         # JSON editor wrapper
    │   ├── document_editor_bottom_bar.tsx   # Save/Cancel bar
    │   └── document_table_view.tsx          # Table view for system indices
    └── services/
        └── api.ts                # HTTP API service
```

### Running Tests

```bash
# Run unit tests
yarn test:jest

# Run linting
yarn lint

# Run type checking
yarn typecheck
```

### Building

```bash
# Build the plugin
yarn build
```

## Configuration

The plugin works with the following OpenSearch Dashboards configuration:

```yaml
# config/opensearch_dashboards.yml

# Optional: Enable data source management for multi-cluster support
data_source.enabled: true

# OpenSearch connection
opensearch.hosts: ["http://localhost:9200"]
opensearch.username: "admin"
opensearch.password: "admin"
```

## Security

This plugin respects OpenSearch security permissions. Users can only:
- View documents they have read access to
- Edit documents in indices they have write access to
- Delete documents in indices they have delete access to

All operations use the authenticated user's OpenSearch client, ensuring proper permission enforcement.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with DCO sign-off (`git commit -s -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use EUI components for UI consistency
- Follow OpenSearch Dashboards plugin development best practices

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
