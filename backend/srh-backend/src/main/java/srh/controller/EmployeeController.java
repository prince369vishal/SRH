package srh.controller;

import srh.entity.Employee;
import srh.service.ServiceInterface.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin("*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> viewEmployeeProfile(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> editEmployeeProfile(
            @PathVariable Long id,
            @RequestBody Employee employee
    ) {
        return ResponseEntity.ok(employeeService.updateEmployeeProfile(id, employee));
    }
}