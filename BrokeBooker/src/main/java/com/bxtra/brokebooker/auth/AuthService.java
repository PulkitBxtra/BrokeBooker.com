package com.bxtra.brokebooker.auth;

import com.bxtra.brokebooker.auth.dto.AuthResponse;
import com.bxtra.brokebooker.auth.dto.LoginRequest;
import com.bxtra.brokebooker.auth.dto.SignupRequest;
import com.bxtra.brokebooker.auth.dto.UserDto;
import com.bxtra.brokebooker.exception.BadRequestException;
import com.bxtra.brokebooker.exception.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
                .email(email)
                .name(req.name().trim())
                .passwordHash(passwordEncoder.encode(req.password()))
                .build();
        user = userRepository.save(user);
        return new AuthResponse(jwtService.issue(user), UserDto.from(user));
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return new AuthResponse(jwtService.issue(user), UserDto.from(user));
    }
}
