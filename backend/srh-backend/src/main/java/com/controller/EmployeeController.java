package com.controller;

import com.dto.request.EmployeeUpdateRequest;
import com.dto.response.EmployeeResponse;
import com.service.ServiceInterface.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin("*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeResponse> viewOwnProfile(Authentication authentication) {
        return ResponseEntity.ok(employeeService.getEmployeeByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<EmployeeResponse> editOwnProfile(
            Authentication authentication,
            @Valid @RequestBody EmployeeUpdateRequest employee
    ) {
        return ResponseEntity.ok(employeeService.updateOwnProfile(authentication.getName(), employee));
    }
}
