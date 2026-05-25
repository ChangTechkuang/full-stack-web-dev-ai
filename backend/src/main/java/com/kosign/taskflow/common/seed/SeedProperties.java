package com.kosign.taskflow.common.seed;

import com.kosign.taskflow.user.domain.Role;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.seed")
public record SeedProperties(boolean enabled, List<SeedUser> users) {

    public record SeedUser(String email, String password, String fullName, Role role) {}
}
