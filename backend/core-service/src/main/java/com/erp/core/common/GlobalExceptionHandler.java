package com.erp.core.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GlobalExceptionHandler – centralised error responses using RFC 7807 ProblemDetail.
 *
 * All errors follow the same JSON envelope:
 * {
 *   "type": "...",
 *   "title": "Bad Request",
 *   "status": 400,
 *   "detail": "...",
 *   "timestamp": "..."
 * }
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** Validation failures (e.g. @NotBlank, @Email) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid",
                        (a, b) -> a));

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Validation Failed");
        pd.setDetail("One or more fields are invalid");
        pd.setType(URI.create("https://erp.platform/errors/validation"));
        pd.setProperty("errors", fieldErrors);
        pd.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.badRequest().body(pd);
    }

    /** Business rule violations (e.g. duplicate email, not found) */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setTitle("Business Rule Violation");
        pd.setDetail(ex.getMessage());
        pd.setType(URI.create("https://erp.platform/errors/conflict"));
        pd.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
    }

    /** Not-found errors surfaced as RuntimeException("... not found") */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Unexpected error";
        boolean isNotFound = msg.toLowerCase().contains("not found");

        HttpStatus status = isNotFound ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
        ProblemDetail pd  = ProblemDetail.forStatus(status);
        pd.setTitle(isNotFound ? "Resource Not Found" : "Internal Server Error");
        pd.setDetail(msg);
        pd.setType(URI.create("https://erp.platform/errors/" + status.value()));
        pd.setProperty("timestamp", Instant.now().toString());

        if (!isNotFound) log.error("Unhandled RuntimeException", ex);
        return ResponseEntity.status(status).body(pd);
    }

    /** Access denied (missing role) */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        pd.setTitle("Access Denied");
        pd.setDetail("You do not have permission to perform this action");
        pd.setType(URI.create("https://erp.platform/errors/forbidden"));
        pd.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(pd);
    }
}
