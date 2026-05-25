package com.kosign.taskflow.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosign.taskflow.common.api.ApiError;
import com.kosign.taskflow.common.api.ApiResponse;
import com.kosign.taskflow.common.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        response.setStatus(ErrorCode.FORBIDDEN.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.error(ApiError.of(ErrorCode.FORBIDDEN.code(), "Access denied"));
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
