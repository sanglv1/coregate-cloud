package com.coregate.backend.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final String adminUsername;
    private final String adminPassword;

    public AuthController(
        @Value("${app.auth.admin-username:sanglv}") String adminUsername,
        @Value("${app.auth.admin-password:Sanglv@123}") String adminPassword
    ) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<SignInResponse> signIn(@Valid @RequestBody SignInRequest request) {
        if (!adminUsername.equals(request.username()) || !adminPassword.equals(request.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new SignInResponse("admin-1", adminUsername, "admin"));
    }

    @PostMapping("/sign-out")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void signOut() {
        // Placeholder for token/session invalidation.
    }

    public record SignInRequest(@NotBlank String username, @NotBlank String password) {}

    public record SignInResponse(String id, String username, String role) {}
}
