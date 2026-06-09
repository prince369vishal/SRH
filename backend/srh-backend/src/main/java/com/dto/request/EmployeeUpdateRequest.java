package com.dto.request;

import com.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "Employee update payload. Null fields are left unchanged.")
public class EmployeeUpdateRequest {

    @Schema(example = "Aarav Sharma")
    private String name;

    @Email
    @Schema(example = "aarav.sharma@example.com")
    private String email;

    @Size(min = 6, max = 72)
    @Schema(example = "newPassword123", description = "Optional replacement password")
    private String password;

    @Schema(example = "EMPLOYEE")
    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
