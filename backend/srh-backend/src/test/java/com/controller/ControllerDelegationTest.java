package com.controller;

import com.dto.request.LoginRequest;
import com.dto.response.LoginResponse;
import com.entity.Employee;
import com.service.ServiceInterface.AuthService;
import com.service.ServiceInterface.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

class ControllerDelegationTest {

    @Test
    void authControllerDelegatesLoginAndLogout() {
        AuthService service = mock(AuthService.class);
        AuthController controller = new AuthController(service);
        LoginRequest request = new LoginRequest();
        LoginResponse loginResponse = new LoginResponse("token", "ADMIN", "admin@example.com");
        ResponseEntity<String> logoutResponse = ResponseEntity.ok("Logged out successfully");
        when(service.login(request)).thenReturn(loginResponse);
        when(service.logout("Bearer token")).thenReturn(logoutResponse);

        assertSame(loginResponse, controller.login(request));
        assertSame(logoutResponse, controller.logout("Bearer token"));
    }

    @Test
    void employeeControllerDelegatesEveryCrudOperation() {
        EmployeeService service = mock(EmployeeService.class);
        EmployeeController controller = new EmployeeController(service);
        Employee employee = new Employee();
        List<Employee> employees = List.of(employee);
        when(service.getAllEmployees()).thenReturn(employees);
        when(service.getEmployeeById(1L)).thenReturn(employee);
        when(service.saveEmployee(employee)).thenReturn(employee);
        when(service.updateEmployee(1L, employee)).thenReturn(employee);

        assertSame(employees, controller.getAllEmployees());
        assertSame(employee, controller.getEmployeeById(1L));
        assertSame(employee, controller.createEmployee(employee));
        assertSame(employee, controller.updateEmployee(1L, employee));
        controller.deleteEmployee(1L);

        verify(service).deleteEmployee(1L);
    }
}
