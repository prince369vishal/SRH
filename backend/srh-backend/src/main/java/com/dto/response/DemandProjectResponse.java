package com.dto.response;

import com.enums.ProjectStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Demand project details")
public class DemandProjectResponse {

    private Long id;
    private String projectName;
    private String description;
    private List<String> requiredSkills;
    private BigDecimal requiredExperience;
    private Integer numberOfResourcesRequired;
    private String department;
    private String location;
    private ProjectStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DemandProjectResponse(Long id, String projectName, String description, List<String> requiredSkills,
                                 BigDecimal requiredExperience, Integer numberOfResourcesRequired,
                                 String department, String location, ProjectStatus status,
                                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.projectName = projectName;
        this.description = description;
        this.requiredSkills = requiredSkills;
        this.requiredExperience = requiredExperience;
        this.numberOfResourcesRequired = numberOfResourcesRequired;
        this.department = department;
        this.location = location;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }

    public String getProjectName() { return projectName; }

    public String getDescription() { return description; }

    public List<String> getRequiredSkills() { return requiredSkills; }

    public BigDecimal getRequiredExperience() { return requiredExperience; }

    public Integer getNumberOfResourcesRequired() { return numberOfResourcesRequired; }

    public String getDepartment() { return department; }

    public String getLocation() { return location; }

    public ProjectStatus getStatus() { return status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
