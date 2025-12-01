# E2E Test Documentation

This directory contains end-to-end tests for the Open Data Integration Platform using Playwright.

## Test Structure

```
e2e/
├── connectors/          # Connector management tests
│   ├── connector-list.spec.ts       # List view tests
│   ├── connector-create.spec.ts     # Creation wizard tests
│   └── connector-approval.spec.ts   # Approval workflow tests
├── data-endpoints/     # Data endpoint tests
│   ├── endpoint-list.spec.ts        # List view tests
│   └── endpoint-create.spec.ts      # Creation wizard tests
├── explorer/           # Data explorer tests
│   └── data-explorer.spec.ts        # Explorer functionality tests
├── fixtures/           # Test data and fixtures
│   └── test-data.ts                 # Test data generators
├── utils/              # Utilities and helpers
│   ├── api-helpers.ts               # API interaction helpers
│   └── page-objects.ts              # Page object models
└── global-setup.ts     # Global test setup
```

## Prerequisites

1. **Backend must be running** on `http://localhost:8080`
2. **Frontend dev server** will be started automatically by Playwright
3. Backend should have a test database configured

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for debugging)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/connectors/connector-list.spec.ts
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

### Connector Management
- ✅ List view with statistics and search
- ✅ Creation wizard (connection details and table selection)
- ✅ Approval workflow for pending connectors
- ✅ Connector deletion

### Data Endpoints
- ✅ List view with search and filtering
- ✅ Multi-step creation wizard
  - Step 1: Select connector
  - Step 2: Define source (table or custom SQL)
  - Step 3: Configure field masking
  - Step 4: Preview data
- ✅ Status toggle
- ✅ Endpoint deletion

### Data Explorer
- ✅ Endpoint selection
- ✅ Data display with pagination
- ✅ Column sorting
- ✅ Masking verification

## Test Data

Tests use the `test-tenant` tenant ID and create temporary test data that includes:
- Test connectors with randomized names
- Test endpoints with randomized paths
- Mock table and column metadata

Most tests include cleanup in `afterEach` hooks to remove test data.

## Page Object Models

Tests use page object models for better maintainability:
- `ConnectorManagementPage` - Connector list page
- `ConnectorWizard` - Connector creation wizard
- `DataEndpointManagementPage` - Data endpoint list page
- `DataEndpointWizard` - Data endpoint creation wizard
- `DataExplorerPage` - Data explorer page

## API Helpers

Helper functions for interacting with the backend API:
- `createConnector()` - Create a connector via API
- `approveConnector()` - Approve a connector
- `createDataEndpoint()` - Create a data endpoint
- `queryEndpoint()` - Query an endpoint
- `cleanupTestData()` - Clean up all test data

## Skipped Tests

Some tests are marked with `.skip()` because they require:
- Real database connections
- Specific test data setup
- Backend features that may not be fully implemented

To enable these tests:
1. Set up a test database
2. Configure test connector credentials in `test-data.ts`
3. Remove the `.skip()` annotation

## Troubleshooting

### Backend not running
If you see "Backend is not available" error:
```bash
# Start the backend first
cd ../backend
mvn spring-boot:run
```

### Frontend not starting
The Playwright config will automatically start the frontend dev server. If it fails:
```bash
# Check that port 5173 is available
# Or update the port in playwright.config.ts
```

### Tests failing
```bash
# Run with UI mode to debug
npm run test:e2e:ui

# View test report
npx playwright show-report
```

### Clean test data
If test data is not cleaning up properly:
```bash
# Manually clean via API or database
# Or restart the backend
```

## CI/CD Integration

Tests are configured to run in CI with:
- Automatic retries (2 retries)
- Sequential execution (1 worker)
- Video and screenshot capture on failure

Test results, videos, and screenshots are saved in:
- `test-results/` - Test results
- `playwright-report/` - HTML report
- `test-results/results.json` - JSON results

## Best Practices

1. **Use page objects** for interacting with UI elements
2. **Use API helpers** for test data setup/cleanup
3. **Add explicit waits** for dynamic content
4. **Use meaningful test names** that describe the scenario
5. **Clean up test data** in `afterEach` hooks
6. **Use `.skip()** for tests requiring external dependencies
7. **Keep tests independent** - each test should work in isolation

## Contributing

When adding new tests:
1. Follow the existing structure
2. Create page objects for new pages
3. Add test data generators if needed
4. Include cleanup in `afterEach`
5. Document any prerequisites
6. Use descriptive test names
