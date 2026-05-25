package com.kosign.taskflow.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosign.taskflow.common.api.ApiError;
import com.kosign.taskflow.common.api.ApiResponse;
import com.kosign.taskflow.common.error.AppException;
import com.kosign.taskflow.common.error.ErrorCode;
import com.kosign.taskflow.user.domain.Role;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = resolveToken(request);
        if (StringUtils.hasText(token)) {
            try {
                authenticate(request, token);
            } catch (AppException ex) {
                SecurityContextHolder.clearContext();
                log.warn("Auth rejected for {} {}: {} ({})",
                        request.getMethod(), request.getRequestURI(),
                        ex.getErrorCode().code(), ex.getMessage());
                writeError(response, ex.getErrorCode(), ex.getMessage());
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, String token) {
        Claims claims = tokenProvider.parse(token);

        if (!"access".equals(claims.get("typ", String.class))) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "Expected access token");
        }

        UUID userId = parseUserId(claims.getSubject());
        String email = claims.get("email", String.class);
        Role role = parseRole(claims.get("role", String.class));

        AuthenticatedUser principal = new AuthenticatedUser(userId, email, "", role, true);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    /**
     * Extract the token from the Authorization header.
     *
     * Tolerant of:
     *   - case-insensitive "Bearer" scheme
     *   - extra whitespace around the credential
     *   - clients that paste "Bearer <token>" into a Swagger auth dialog (yielding
     *     "Authorization: Bearer Bearer <token>") by stripping repeated prefixes.
     */
    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(header)) {
            return null;
        }
        String value = header.trim();
        if (value.length() < BEARER_PREFIX.length()
                || !value.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            return null;
        }
        String candidate = value.substring(BEARER_PREFIX.length()).trim();
        while (candidate.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            candidate = candidate.substring(BEARER_PREFIX.length()).trim();
        }
        return candidate;
    }

    private UUID parseUserId(String subject) {
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token subject is not a valid user id");
        }
    }

    private Role parseRole(String roleClaim) {
        if (!StringUtils.hasText(roleClaim)) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token is missing role claim");
        }
        try {
            return Role.valueOf(roleClaim);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.TOKEN_INVALID, "Unknown role in token");
        }
    }

    private void writeError(HttpServletResponse response, ErrorCode code, String message) throws IOException {
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.error(ApiError.of(code.code(), message));
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
