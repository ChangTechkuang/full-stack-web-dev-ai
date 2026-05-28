package com.kosign.taskflow.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Externally-configured CORS settings.
 *
 * <p>{@code app.cors.allowed-origins} accepts a comma-separated list of origin
 * patterns (Spring's {@code allowedOriginPatterns}, so wildcards like
 * {@code https://*.vercel.app} are valid). Defaults to {@code "*"} to keep
 * local development frictionless; production deployments override this with
 * the concrete frontend URL(s).
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = List.of("*");
        }
    }
}
