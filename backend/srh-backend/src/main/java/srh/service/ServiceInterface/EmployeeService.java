package srh.service.ServiceInterface;


import srh.entity.Employee;

import java.util.List;

public interface EmployeeService {

	Employee createEmployee(Employee employee);

	List<Employee> getAllEmployees();

	Employee getEmployeeById(Long id);

	Employee updateEmployee(Long id, Employee employee);

	void deleteEmployee(Long id);

	Employee getEmployeeByEmail(String email);

	Employee updateEmployeeProfile(Long id, Employee employee);
}
