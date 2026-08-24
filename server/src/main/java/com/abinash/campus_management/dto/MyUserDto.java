package com.abinash.campus_management.dto;


import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MyUserDto {
    @NotNull(message = "name can't be null")
    @NotBlank(message = "name field can't be blank")
    @Size(min = 3, max = 20, message = "name length should be between 3 to 20")
    @Pattern(regexp = "^\\S+$", message = "Username cannot contain spaces")
    private String name;
    @NotBlank(message = "password field can't be blank")
    @Size(min = 8, max = 30)
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$",
            message = "Password must contain uppercase, lowercase, number, and special character"
    )
    private String password;
}