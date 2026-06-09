package com.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authenticated session response")
public class LoginResponse {

    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Schema(example = "ADMIN")
    private String role;

    @Schema(example = "admin@example.com")
    private String email;

    public LoginResponse(String token, String role, String email) {
        this.token = token;
        this.role = role;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }
}
