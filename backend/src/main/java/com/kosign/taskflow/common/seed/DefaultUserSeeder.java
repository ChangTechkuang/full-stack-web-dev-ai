package com.kosign.taskflow.common.seed;

import com.kosign.taskflow.user.domain.User;
import com.kosign.taskflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(SeedProperties.class)
public class DefaultUserSeeder {

    private final SeedProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;

    @Bean
    ApplicationRunner seedDefaultUsersRunner() {
        return args -> {
            if (!properties.enabled()) {
                log.info("Default user seeding disabled");
                return;
            }
            List<SeedProperties.SeedUser> users = properties.users();
            if (users == null || users.isEmpty()) {
                log.info("No default users configured");
                return;
            }
            transactionTemplate.executeWithoutResult(status -> users.forEach(this::upsert));
        };
    }

    private void upsert(SeedProperties.SeedUser seed) {
        if (userRepository.existsByEmailIgnoreCase(seed.email())) {
            log.debug("Seed user already present: {}", seed.email());
            return;
        }
        User user = User.builder()
                .email(seed.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(seed.password()))
                .fullName(seed.fullName())
                .role(seed.role())
                .enabled(true)
                .build();
        userRepository.save(user);
        log.info("Seeded default user: {} ({})", seed.email(), seed.role());
    }
}
