package com.gs.dsp.shared.infrastructure.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private String error;
    private String message;
    private String path;
    private Map<String, Object> details;

    public ErrorResponse(String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.error = error;
        this.message = message;
    }

    public ErrorResponse(String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.error = error;
        this.message = message;
        this.path = path;
    }
}
