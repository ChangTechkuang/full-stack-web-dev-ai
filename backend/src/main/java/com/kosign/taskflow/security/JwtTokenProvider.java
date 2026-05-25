package com.kosign.taskflow.security;

import com.kosign.taskflow.common.error.AppException;
import com.kosign.taskflow.common.error.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.IncorrectClaimException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.MissingClaimException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        byte[] keyBytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 bytes)");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(properties.accessTokenExpirationMs());
        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .claim("typ", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public long accessTokenExpiresInSeconds() {
        return properties.accessTokenExpirationMs() / 1000L;
    }

    public long refreshTokenExpirationMs() {
        return properties.refreshTokenExpirationMs();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(properties.issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Token expired");
        } catch (SignatureException e) {
            log.warn("JWT signature mismatch: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token signature invalid");
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token is malformed");
        } catch (UnsupportedJwtException e) {
            log.warn("JWT unsupported: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token format not supported");
        } catch (MissingClaimException | IncorrectClaimException e) {
            log.warn("JWT claim mismatch: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token claim mismatch (issuer or type)");
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT rejected: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Invalid token");
        }
    }
}
