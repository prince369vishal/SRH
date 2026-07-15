package com.controller;

import com.dto.request.DemandProjectRequest;
import com.dto.request.ShortlistRequest;
import com.dto.response.DemandProjectResponse;
import com.dto.response.EmployeeResponse;
import com.service.ServiceInterface.DemandProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/demands/projects")
@Tag(name = "Demand Management", description = "Project demand APIs for PROJECT_ADMINISTRATOR users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('PROJECT_ADMINISTRATOR')")
public class DemandProjectController {

    private final DemandProjectService demandProjectService;

    public DemandProjectController(DemandProjectService demandProjectService) {
        this.demandProjectService = demandProjectService;
    }

    @Operation(summary = "Create demand project")
    @PostMapping
    public ResponseEntity<DemandProjectResponse> createProject(@Valid @RequestBody DemandProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(demandProjectService.createProject(request));
    }

    @Operation(summary = "List demand projects")
    @GetMapping
    public ResponseEntity<List<DemandProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(demandProjectService.getAllProjects());
    }

    @Operation(summary = "Get demand project by ID")
    @GetMapping("/{id}")
    public ResponseEntity<DemandProjectResponse> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(demandProjectService.getProjectById(id));
    }

    @Operation(summary = "Update demand project")
    @PutMapping("/{id}")
    public ResponseEntity<DemandProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody DemandProjectRequest request
    ) {
        return ResponseEntity.ok(demandProjectService.updateProject(id, request));
    }

    @Operation(summary = "Delete demand project")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        demandProjectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get employees with matching skills for a demand project")
    @GetMapping("/{id}/matched-employees")
    public ResponseEntity<List<EmployeeResponse>> getMatchedEmployees(@PathVariable Long id) {
        return ResponseEntity.ok(demandProjectService.getMatchedEmployees(id));
    }

    @Operation(summary = "Shortlist employees for a demand project")
    @PutMapping("/{id}/shortlist")
    public ResponseEntity<List<EmployeeResponse>> shortlistEmployees(
            @PathVariable Long id,
            @Valid @RequestBody ShortlistRequest request
    ) {
        return ResponseEntity.ok(demandProjectService.shortlistEmployees(id, request));
    }
}
