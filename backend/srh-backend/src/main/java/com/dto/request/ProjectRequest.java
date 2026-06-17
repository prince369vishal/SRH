package com.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ProjectRequest {
    @NotBlank
    private String name;
    private String description;
    @NotEmpty @Valid
    private List<ProjectRequirementRequest> requirements;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ProjectRequirementRequest> getRequirements() { return requirements; }
    public void setRequirements(List<ProjectRequirementRequest> requirements) { this.requirements = requirements; }
}