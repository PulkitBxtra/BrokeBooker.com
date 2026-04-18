package com.bxtra.brokebooker.auth;

import com.bxtra.brokebooker.auth.dto.AuthResponse;
import com.bxtra.brokebooker.auth.dto.LoginRequest;
import com.bxtra.brokebooker.auth.dto.SignupRequest;
import com.bxtra.brokebooker.auth.dto.UserDto;
import com.bxtra.brokebooker.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        return ResponseEntity.ok(authService.signup(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Not authenticated");
        }
        return ResponseEntity.ok(UserDto.from(user));
    }
}
