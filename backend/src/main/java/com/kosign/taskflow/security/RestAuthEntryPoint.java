package com.kosign.taskflow.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosign.taskflow.common.api.ApiError;
import com.kosign.taskflow.common.api.ApiResponse;
import com.kosign.taskflow.common.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        response.setStatus(ErrorCode.UNAUTHORIZED.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.error(ApiError.of(ErrorCode.UNAUTHORIZED.code(), "Authentication required"));
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
