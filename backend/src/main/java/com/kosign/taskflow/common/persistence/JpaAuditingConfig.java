package com.kosign.taskflow.common.persistence;

import com.kosign.taskflow.security.AuthenticatedUser;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Component("auditorProvider")
    public static class SecurityAuditorAware implements AuditorAware<UUID> {

        @Override
        public Optional<UUID> getCurrentAuditor() {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
                return Optional.empty();
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof AuthenticatedUser u) {
                return Optional.of(u.id());
            }
            return Optional.empty();
        }
    }
}
