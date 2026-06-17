package com.dto.request;

import com.enums.ProjectStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "Demand project creation or update payload")
public class DemandProjectRequest {

    @NotBlank
    @Schema(example = "Retail Banking Modernization")
    private String projectName;

    private String description;

    private List<String> requiredSkills = new ArrayList<>();

    @Schema(example = "4.5")
    private BigDecimal requiredExperience;

    @NotNull
    @Min(1)
    @Schema(example = "5")
    private Integer numberOfResourcesRequired;

    private String department;
    private String location;
    private ProjectStatus status;

    public String getProjectName() { return projectName; }

    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public List<String> getRequiredSkills() { return requiredSkills; }

    public void setRequiredSkills(List<String> requiredSkills) { this.requiredSkills = requiredSkills; }

    public BigDecimal getRequiredExperience() { return requiredExperience; }

    public void setRequiredExperience(BigDecimal requiredExperience) { this.requiredExperience = requiredExperience; }

    public Integer getNumberOfResourcesRequired() { return numberOfResourcesRequired; }

    public void setNumberOfResourcesRequired(Integer numberOfResourcesRequired) {
        this.numberOfResourcesRequired = numberOfResourcesRequired;
    }

    public String getDepartment() { return department; }

    public void setDepartment(String department) { this.department = department; }

    public String getLocation() { return location; }

    public void setLocation(String location) { this.location = location; }

    public ProjectStatus getStatus() { return status; }

    public void setStatus(ProjectStatus status) { this.status = status; }
}
