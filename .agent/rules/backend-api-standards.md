---
trigger: always_on
---

```yaml
ruleset:
  name: "Backend API Standards for Developers"
  version: 1.0
  description: >
    Policy guidelines for Developers implementing backend REST API, logging, error handling, and production debugging. All rules are mandatory unless explicitly overridden.

  rules:

    # 1. Exception Handling
    - id: exception.global-handler
      directive: "Always use @RestControllerAdvice for REST APIs."
    - id: exception.no-internal-leak
      directive: "Never return stacktraces, Java exceptions, or class names to the client."
    - id: exception.standard-response
      directive: "All errors must follow the standard JSON format with code, message, and traceId."

    # 2. Logging & MDC
    - id: logging.use-mdc
      directive: "Use MDC for traceId and userId on every request."
    - id: logging.trace-id-required
      directive: "Every log entry must include traceId."
    - id: logging.no-sensitive
      directive: "Never log sensitive data such as passwords, tokens, OTP, keys, or PII."

    # 3. Logback Configuration
    - id: logback.json-console
      directive: "Console logging must be JSON for log aggregation systems."
    - id: logback.file-rotation
      directive: "Enable rolling file logs with daily rotation and compression."
    - id: logback.no-debug-prod
      directive: "DEBUG/TRACE logs must be disabled in production by default."

    # 4. Runtime Logger Level
    - id: runtime.logging-actuator
      directive: "Expose Actuator /loggers endpoint for runtime log level change."
    - id: runtime.do-not-debug-root
      directive: "Never change root logger to DEBUG in production."
    - id: runtime.revert-after-debug
      directive: "Always revert logger level to INFO after debugging."

    # 5. Error Response
    - id: error.no-internal-info
      directive: "Do not expose internal backend messages or stacktraces to clients."
    - id: error.must-have-code
      directive: "Every error must include a unique error code."
    - id: error.must-have-traceId
      directive: "Every error response must include traceId."

    # 6. Business Validation
    - id: business.custom-exceptions
      directive: "Business validation must use custom exceptions."
    - id: business.http-code
      directive: "Business errors must return 400 or 422."

    # 7. Request Handling
    - id: request.trace-id
      directive: "TraceId must exist for every incoming request."
    - id: request.no-sensitive-logging
      directive: "Do not log sensitive request or response data."

    # 8. Security
    - id: security.no-sensitive-return
      directive: "Error responses must never return sensitive internal system details."

    # 9. Production Debugging
    - id: debug.workflow
      directive: >
        Debugging must follow the workflow:
        obtain traceId, inspect logs, selectively enable DEBUG for specific package, then revert.
    - id: debug.no-global-debug
      directive: "Never enable DEBUG for root logger."

    # 10. Microservice Tracing
    - id: micro.trace-propagation
      directive: "traceId must propagate through all internal service calls."
    - id: micro.open-telemetry
      directive: "Prefer Sleuth/Micrometer/OpenTelemetry for distributed tracing."
