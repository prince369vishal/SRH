package com.dto.response;

import com.enums.Role;

public class EmployeeResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String skills;
    private Integer experienceYears;

    public EmployeeResponse() {}

    // Original constructor kept for backward compatibility
    public EmployeeResponse(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public EmployeeResponse(Long id, String name, String email, Role role,
                            String skills, Integer experienceYears) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.skills = skills;
        this.experienceYears = experienceYears;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
}