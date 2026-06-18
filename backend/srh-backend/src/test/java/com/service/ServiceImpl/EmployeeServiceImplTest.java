package com.service.ServiceImpl;

import com.entity.Employee;
import com.enums.Role;
import com.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private EmployeeServiceImpl employeeService;

    @BeforeEach
    void setUp() {
        employeeService = new EmployeeServiceImpl(employeeRepository, passwordEncoder);
    }

    @Test
    void getAllEmployeesReturnsRepositoryResults() {
        List<Employee> employees = List.of(employee(1L, "A", "a@example.com", null, Role.EMPLOYEE));
        when(employeeRepository.findAll()).thenReturn(employees);

        assertSame(employees, employeeService.getAllEmployees());
    }

    @Test
    void getEmployeeByIdReturnsEmployeeOrThrowsNotFound() {
        Employee employee = employee(1L, "A", "a@example.com", null, Role.EMPLOYEE);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findById(2L)).thenReturn(Optional.empty());

        assertSame(employee, employeeService.getEmployeeById(1L));
        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> employeeService.getEmployeeById(2L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void saveEmployeeEncodesPlainTextPassword() {
        Employee employee = employee(null, "A", "a@example.com", "secret", Role.EMPLOYEE);
        when(passwordEncoder.encode("secret")).thenReturn("$2encoded");
        when(employeeRepository.save(employee)).thenReturn(employee);

        Employee saved = employeeService.saveEmployee(employee);

        assertEquals("$2encoded", saved.getPassword());
        verify(employeeRepository).save(employee);
    }

    @Test
    void saveEmployeeDoesNotReencodeBcryptOrNullPassword() {
        Employee bcrypt = employee(null, "A", "a@example.com", "$2encoded", Role.EMPLOYEE);
        Employee noPassword = employee(null, "B", "b@example.com", null, Role.EMPLOYEE);

        employeeService.saveEmployee(bcrypt);
        employeeService.saveEmployee(noPassword);

        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void updateEmployeeChangesFieldsAndEncodesNewPassword() {
        Employee existing = employee(1L, "Old", "old@example.com", "$2old", Role.EMPLOYEE);
        Employee update = employee(null, "New", "new@example.com", "new-secret", Role.ADMIN);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("new-secret")).thenReturn("$2new");
        when(employeeRepository.save(existing)).thenReturn(existing);

        Employee result = employeeService.updateEmployee(1L, update);

        assertEquals("New", result.getName());
        assertEquals("new@example.com", result.getEmail());
        assertEquals(Role.ADMIN, result.getRole());
        assertEquals("$2new", result.getPassword());
    }

    @Test
    void updateEmployeeKeepsExistingPasswordWhenReplacementIsBlank() {
        Employee existing = employee(1L, "Old", "old@example.com", "$2old", Role.EMPLOYEE);
        Employee update = employee(null, "New", "new@example.com", " ", Role.ADMIN);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(employeeRepository.save(existing)).thenReturn(existing);

        employeeService.updateEmployee(1L, update);

        assertEquals("$2old", existing.getPassword());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void deleteEmployeeLoadsThenDeletesEmployee() {
        Employee employee = employee(1L, "A", "a@example.com", null, Role.EMPLOYEE);
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        employeeService.deleteEmployee(1L);

        verify(employeeRepository).delete(employee);
    }

    private Employee employee(Long id, String name, String email, String password, Role role) {
        return new Employee(id, name, email, password, role);
    }
}
