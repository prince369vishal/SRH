package com.service.ServiceImpl;

import com.dto.request.EmployeeRequest;
import com.dto.request.EmployeeUpdateRequest;
import com.dto.response.BulkImportResponse;
import com.dto.response.EmployeeResponse;
import com.entity.Certification;
import com.entity.Employee;
import com.entity.ProjectHistory;
import com.entity.SkillEntry;
import com.enums.EmployeeStatus;
import com.enums.Role;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.EmployeeService;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public EmployeeResponse saveEmployee(EmployeeRequest request) {
        ensureEmailAvailable(request.getEmail(), null);
        ensureEmployeeCodeAvailable(request.getEmployeeCode(), null);

        Employee employee = buildEmployee(request);
        return toResponse(employeeRepository.save(employee));
    }

    private Employee buildEmployee(EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setEmail(request.getEmail());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setLocation(request.getLocation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus() == null ? EmployeeStatus.ON_BENCH : request.getStatus());
        employee.setBenchStartDate(request.getBenchStartDate());
        employee.setManagerId(request.getManagerId());
        employee.setExperienceYears(request.getExperienceYears());
        employee.setActive(request.getActive() == null || request.getActive());
        employee.setSkills(request.getSkills());
        employee.setCertifications(request.getCertifications());
        employee.setProjectHistory(request.getProjectHistory());
        return employee;
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findEmployeeById(id));
    }

    @Override
    public EmployeeResponse getEmployeeByEmail(String email) {
        return toResponse(findEmployeeByEmail(email));
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = findEmployeeById(id);
        applyAdminUpdates(employee, request);
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse updateOwnProfile(String email, EmployeeUpdateRequest request) {
        Employee employee = findEmployeeByEmail(email);

        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getLocation() != null) employee.setLocation(request.getLocation());
        if (request.getExperienceYears() != null) employee.setExperienceYears(request.getExperienceYears());
        if (request.getSkills() != null) employee.setSkills(request.getSkills());
        if (request.getCertifications() != null) employee.setCertifications(request.getCertifications());

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public BulkImportResponse bulkImportEmployees(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Import file is required");
        }

        List<Map<String, String>> rows = readImportRows(file);
        int importedCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();

        for (int index = 0; index < rows.size(); index++) {
            int rowNumber = index + 2;
            try {
                EmployeeRequest request = toEmployeeRequest(rows.get(index));
                saveEmployee(request);
                importedCount++;
            } catch (Exception exception) {
                skippedCount++;
                errors.add("Row " + rowNumber + ": " + exception.getMessage());
            }
        }

        return new BulkImportResponse(importedCount, skippedCount, errors);
    }

    @Override
    public void deleteEmployee(Long id) {
        employeeRepository.delete(findEmployeeById(id));
    }

    private Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with id: " + id));
    }

    private Employee findEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with email: " + email));
    }

    private void applyAdminUpdates(Employee employee, EmployeeUpdateRequest request) {
        if (request.getEmployeeCode() != null) {
            ensureEmployeeCodeAvailable(request.getEmployeeCode(), employee.getId());
            employee.setEmployeeCode(request.getEmployeeCode());
        }
        if (request.getEmail() != null) {
            ensureEmailAvailable(request.getEmail(), employee.getId());
            employee.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) employee.setRole(request.getRole());
        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getDepartment() != null) employee.setDepartment(request.getDepartment());
        if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
        if (request.getLocation() != null) employee.setLocation(request.getLocation());
        if (request.getJoiningDate() != null) employee.setJoiningDate(request.getJoiningDate());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getBenchStartDate() != null) employee.setBenchStartDate(request.getBenchStartDate());
        if (request.getManagerId() != null) employee.setManagerId(request.getManagerId());
        if (request.getExperienceYears() != null) employee.setExperienceYears(request.getExperienceYears());
        if (request.getFirstLogin() != null) employee.setFirstLogin(request.getFirstLogin());
        if (request.getActive() != null) employee.setActive(request.getActive());
        if (request.getSkills() != null) employee.setSkills(request.getSkills());
        if (request.getCertifications() != null) employee.setCertifications(request.getCertifications());
        if (request.getProjectHistory() != null) employee.setProjectHistory(request.getProjectHistory());
    }

    private void ensureEmailAvailable(String email, Long currentEmployeeId) {
        employeeRepository.findByEmail(email)
                .filter(employee -> !Objects.equals(employee.getId(), currentEmployeeId))
                .ifPresent(employee -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee email already exists");
                });
    }

    private void ensureEmployeeCodeAvailable(String employeeCode, Long currentEmployeeId) {
        employeeRepository.findByEmployeeCode(employeeCode)
                .filter(employee -> !Objects.equals(employee.getId(), currentEmployeeId))
                .ifPresent(employee -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code already exists");
                });
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getEmail(),
                employee.getRole(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getPhoneNumber(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getLocation(),
                employee.getJoiningDate(),
                employee.getStatus(),
                employee.getBenchStartDate(),
                employee.getManagerId(),
                employee.getExperienceYears(),
                employee.getFirstLogin(),
                employee.getActive(),
                employee.getSkills(),
                employee.getCertifications(),
                employee.getProjectHistory()
        );
    }

    private List<Map<String, String>> readImportRows(MultipartFile file) {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        try {
            if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                return readExcelRows(file);
            }
            return readCsvRows(file);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read import file");
        }
    }

    private List<Map<String, String>> readCsvRows(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) return rows;
            List<String> headers = parseCsvLine(headerLine).stream().map(this::normalizeHeader).toList();

            String line;
            while ((line = reader.readLine()) != null) {
                List<String> values = parseCsvLine(line);
                rows.add(toRowMap(headers, values));
            }
        }
        return rows;
    }

    private List<Map<String, String>> readExcelRows(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return rows;

            List<String> headers = new ArrayList<>();
            for (int cellIndex = 0; cellIndex < headerRow.getLastCellNum(); cellIndex++) {
                headers.add(normalizeHeader(formatter.formatCellValue(headerRow.getCell(cellIndex))));
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;
                List<String> values = new ArrayList<>();
                for (int cellIndex = 0; cellIndex < headers.size(); cellIndex++) {
                    values.add(formatter.formatCellValue(row.getCell(cellIndex)));
                }
                rows.add(toRowMap(headers, values));
            }
        }
        return rows;
    }

    private Map<String, String> toRowMap(List<String> headers, List<String> values) {
        Map<String, String> row = new HashMap<>();
        for (int index = 0; index < headers.size(); index++) {
            row.put(headers.get(index), index < values.size() ? values.get(index).trim() : "");
        }
        return row;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;

        for (int index = 0; index < line.length(); index++) {
            char value = line.charAt(index);
            if (value == '"') {
                quoted = !quoted;
            } else if (value == ',' && !quoted) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(value);
            }
        }
        values.add(current.toString());
        return values;
    }

    private EmployeeRequest toEmployeeRequest(Map<String, String> row) {
        EmployeeRequest request = new EmployeeRequest();
        request.setEmployeeCode(required(row, "employeeCode"));
        request.setEmail(required(row, "email"));
        request.setPassword(value(row, "password").isBlank() ? "employee123" : value(row, "password"));
        request.setRole(parseRole(value(row, "role")));
        request.setFirstName(required(row, "firstName"));
        request.setLastName(required(row, "lastName"));
        request.setPhoneNumber(value(row, "phoneNumber"));
        request.setDepartment(value(row, "department"));
        request.setDesignation(value(row, "designation"));
        request.setLocation(value(row, "location"));
        request.setJoiningDate(parseDate(value(row, "joiningDate")));
        request.setStatus(parseEmployeeStatus(value(row, "status")));
        request.setBenchStartDate(parseDate(value(row, "benchStartDate")));
        request.setManagerId(parseLong(value(row, "managerId")));
        request.setExperienceYears(parseDecimal(value(row, "experienceYears")));
        request.setActive(parseBoolean(value(row, "active")));
        request.setSkills(parseSkills(value(row, "skills")));
        request.setCertifications(parseCertifications(value(row, "certifications")));
        request.setProjectHistory(parseProjectHistory(value(row, "projectHistory")));
        return request;
    }

    private String required(Map<String, String> row, String key) {
        String value = value(row, key);
        if (value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value;
    }

    private String value(Map<String, String> row, String key) {
        return row.getOrDefault(normalizeHeader(key), "");
    }

    private String normalizeHeader(String value) {
        return value == null ? "" : value.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
    }

    private Role parseRole(String value) {
        if (value == null || value.isBlank()) return Role.EMPLOYEE;
        String normalized = value.trim().toUpperCase();
        if ("PROJECT_ADMIN".equals(normalized)) return Role.PROJECT_ADMINISTRATOR;
        return Role.valueOf(normalized);
    }

    private EmployeeStatus parseEmployeeStatus(String value) {
        return value == null || value.isBlank() ? EmployeeStatus.ON_BENCH : EmployeeStatus.valueOf(value.trim().toUpperCase());
    }

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value.trim());
    }

    private Long parseLong(String value) {
        return value == null || value.isBlank() ? null : Long.valueOf(value.trim());
    }

    private BigDecimal parseDecimal(String value) {
        return value == null || value.isBlank() ? null : new BigDecimal(value.trim());
    }

    private Boolean parseBoolean(String value) {
        return value == null || value.isBlank() ? null : Boolean.valueOf(value.trim());
    }

    private List<SkillEntry> parseSkills(String value) {
        return splitValues(value).stream()
                .map(skillName -> SkillEntry.builder().skillName(skillName).build())
                .toList();
    }

    private List<Certification> parseCertifications(String value) {
        return splitValues(value).stream()
                .map(certificationName -> Certification.builder().certificationName(certificationName).build())
                .toList();
    }

    private List<ProjectHistory> parseProjectHistory(String value) {
        return splitValues(value).stream()
                .map(projectName -> ProjectHistory.builder().projectName(projectName).build())
                .toList();
    }

    private List<String> splitValues(String value) {
        if (value == null || value.isBlank()) return new ArrayList<>();
        return List.of(value.split("[,;]")).stream()
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}