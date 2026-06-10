// ─── EmployeeRequest.java (UPDATED) ───────────────────────────────────────────
// Replace your existing EmployeeRequest with this version

package com.dto.request;

import com.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

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
    @Schema(example = "employee123")
    private String password;

    @NotNull
    @Schema(example = "EMPLOYEE")
    private Role role;

    @Schema(example = "Java,Spring Boot,React", description = "Comma-separated list of skills")
    private String skills;

    @Min(0)
    @Schema(example = "3", description = "Years of experience")
    private Integer experienceYears;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
}