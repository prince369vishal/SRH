package com.dto.response;

import java.util.List;

public class ProjectRequirementResponse {
    private Long id;
    private String roleName;
    private String requiredSkills;
    private Integer minExperienceYears;
    private Integer numberOfPeople;
    private String assignedEmployeeIds;
    private List<EmployeeResponse> matchedEmployees;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public Integer getMinExperienceYears() { return minExperienceYears; }
    public void setMinExperienceYears(Integer minExperienceYears) { this.minExperienceYears = minExperienceYears; }
    public Integer getNumberOfPeople() { return numberOfPeople; }
    public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }
    public String getAssignedEmployeeIds() { return assignedEmployeeIds; }
    public void setAssignedEmployeeIds(String assignedEmployeeIds) { this.assignedEmployeeIds = assignedEmployeeIds; }
    public List<EmployeeResponse> getMatchedEmployees() { return matchedEmployees; }
    public void setMatchedEmployees(List<EmployeeResponse> matchedEmployees) { this.matchedEmployees = matchedEmployees; }
}