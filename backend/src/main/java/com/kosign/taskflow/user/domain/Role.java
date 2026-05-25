package com.kosign.taskflow.user.domain;

public enum Role {
    EMPLOYEE,
    MANAGER;

    public String authority() {
        return "ROLE_" + name();
    }
}
