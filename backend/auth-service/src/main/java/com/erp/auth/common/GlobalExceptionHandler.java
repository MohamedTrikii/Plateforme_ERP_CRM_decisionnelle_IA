package com.erp.auth.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GlobalExceptionHandler for auth-service.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    private static final String TIMESTAMP_PROPERTY = "timestamp";

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
        pd.setProperty("errors", fieldErrors);
        pd.setProperty(TIMESTAMP_PROPERTY, Instant.now().toString());
        return ResponseEntity.badRequest().body(pd);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @SuppressWarnings("null")
    public ResponseEntity<ProblemDetail> handleBadCredentials(BadCredentialsException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        pd.setTitle("Authentication Failed");
        pd.setDetail("Invalid username or password");
        pd.setType(URI.create("https://erp.platform/errors/unauthorized"));
        pd.setProperty(TIMESTAMP_PROPERTY, Instant.now().toString());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(pd);
    }

    @ExceptionHandler(DisabledException.class)
    @SuppressWarnings("null")
    public ResponseEntity<ProblemDetail> handleDisabled(DisabledException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        pd.setTitle("Account Disabled");
        pd.setDetail("Your account has been deactivated. Please contact your administrator.");
        pd.setType(URI.create("https://erp.platform/errors/forbidden"));
        pd.setProperty(TIMESTAMP_PROPERTY, Instant.now().toString());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(pd);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @SuppressWarnings("null")
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setTitle("Registration Failed");
        pd.setDetail(ex.getMessage());
        pd.setType(URI.create("https://erp.platform/errors/conflict"));
        pd.setProperty(TIMESTAMP_PROPERTY, Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(pd);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProblemDetail> handleRuntime(RuntimeException ex) {
        log.error("Unhandled exception in auth-service", ex);
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setTitle("Internal Server Error");
        pd.setDetail("An unexpected error occurred");
        pd.setProperty(TIMESTAMP_PROPERTY, Instant.now().toString());
        return ResponseEntity.internalServerError().body(pd);
    }
}
