@echo off
echo ====================================
echo Git Commit Script for ldop-demo
echo ====================================

cd /d %~dp0

echo.
echo [1/3] Checking git status...
git status

echo.
echo [2/3] Staging all changes...
git add -A

echo.
echo [3/3] Committing changes...
git commit -m "feat(connector): implement real test connection and optimize connection logic

- Add POST /api/v1/connectors/{id}/test-connection endpoint for existing connectors
- Fix GlobalExceptionHandler to handle connection timeout exceptions (SQLException, SocketTimeoutException, ConnectException, DataAccessException)
- Refactor ConnectorMetadataService to reuse connector for existing connections (optimize test connection logic)
- Remove mockup test connection logic from ConnectorDetails.tsx
- Update frontend to call real test connection API
- Add testConnectionById method to connectorService.ts"

echo.
echo [Push to remote? Press any key to push or Ctrl+C to cancel]
pause

git push origin refactor/code-quality-improvements

echo.
echo ====================================
echo Done!
echo ====================================
pause
