package com.dto.response;

import com.entity.Certification;
import com.entity.ProjectHistory;
import com.entity.SkillEntry;
import com.enums.EmployeeStatus;
import com.enums.Role;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Employee details returned by the API. Passwords are never returned.")
public class EmployeeResponse {
    private Long id;

    private String employeeCode;

    @Schema(example = "aarav.sharma@example.com")
    private String email;
    private Role role;
    private String skills;
    private Integer experienceYears;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String department;
    private String designation;
    private String location;
    private LocalDate joiningDate;
    private EmployeeStatus status;
    private LocalDate benchStartDate;
    private Long performanceManagerId;
    private Boolean firstLogin;
    private Boolean active;
    private List<SkillEntry> skills;
    private List<Certification> certifications;
    private List<ProjectHistory> projectHistory;

    public EmployeeResponse(Long id, String employeeCode, String email, Role role, String firstName, String lastName,
                            String phoneNumber, String department, String designation, String location,
                            LocalDate joiningDate, EmployeeStatus status, LocalDate benchStartDate,
                            Long performanceManagerId, Boolean firstLogin, Boolean active,
                            List<SkillEntry> skills, List<Certification> certifications,
                            List<ProjectHistory> projectHistory) {
        this.id = id;
        this.employeeCode = employeeCode;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.designation = designation;
        this.location = location;
        this.joiningDate = joiningDate;
        this.status = status;
        this.benchStartDate = benchStartDate;
        this.performanceManagerId = performanceManagerId;
        this.firstLogin = firstLogin;
        this.active = active;
        this.skills = skills;
        this.certifications = certifications;
        this.projectHistory = projectHistory;
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

    public String getEmployeeCode() { return employeeCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() {
        return role;
    }

    public String getFirstName() { return firstName; }

    public String getLastName() { return lastName; }

    public String getPhoneNumber() { return phoneNumber; }

    public String getDepartment() { return department; }

    public String getDesignation() { return designation; }

    public String getLocation() { return location; }

    public LocalDate getJoiningDate() { return joiningDate; }

    public EmployeeStatus getStatus() { return status; }

    public LocalDate getBenchStartDate() { return benchStartDate; }

    public Long getPerformanceManagerId() { return performanceManagerId; }

    public Boolean getFirstLogin() { return firstLogin; }

    public Boolean getActive() { return active; }

    public List<SkillEntry> getSkills() { return skills; }

    public List<Certification> getCertifications() { return certifications; }

    public List<ProjectHistory> getProjectHistory() { return projectHistory; }
}
