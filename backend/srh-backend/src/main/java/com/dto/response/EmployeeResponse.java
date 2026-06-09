package com.dto.response;

import com.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Employee details returned by the API. Passwords are never returned.")
public class EmployeeResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "Aarav Sharma")
    private String name;

    @Schema(example = "aarav.sharma@example.com")
    private String email;

    @Schema(example = "EMPLOYEE")
    private Role role;

    public EmployeeResponse(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
