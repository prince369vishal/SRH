package com.controller;

import com.dto.response.BulkImportResponse;
import com.service.ServiceInterface.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/operator/employees")
@Tag(name = "Operator Employee Import", description = "CSV and Excel employee import APIs for OPERATOR users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('OPERATOR')")
public class OperatorEmployeeImportController {

    private final EmployeeService employeeService;

    public OperatorEmployeeImportController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @Operation(summary = "Bulk import employees from CSV or Excel")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkImportResponse> importEmployees(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(employeeService.bulkImportEmployees(file));
    }
}
