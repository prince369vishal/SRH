package com.dto.request;

import com.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Employee creation payload. Only ADMIN users can create employees.")
public class EmployeeRequest {

    @NotBlank
    @Schema(example = "Aarav Sharma")
    private String name;

    @NotBlank
    @Email
    @Schema(example = "aarav.sharma@example.com")
    private String email;

    @NotBlank
    @Size(min = 6, max = 72)
    @Schema(example = "employee123", description = "Temporary login password set by admin")
    private String password;

    @NotNull
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
