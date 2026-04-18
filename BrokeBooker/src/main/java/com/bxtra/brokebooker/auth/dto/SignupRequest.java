package com.bxtra.brokebooker.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank @Size(min = 2, max = 80) String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 128) String password
) {}
