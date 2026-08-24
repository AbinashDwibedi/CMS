package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.MyUserDto;
import com.abinash.campus_management.entity.MyUser;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.MyUserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MyUserService {
    private final MyUserRepository myUserRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public MyUserDto registerUser(MyUserDto userDto) {

        MyUser myUser = modelMapper.map(userDto, MyUser.class);
        myUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        MyUser responseUser = myUserRepository.save(myUser);
        MyUserDto myUserDto = modelMapper.map(responseUser, MyUserDto.class);
        myUserDto.setPassword(null);
        return myUserDto;
    }

    @Transactional
    public void deleteUser(String name) {
        MyUser myUser = myUserRepository.findByName(name)
                .orElseThrow(() -> new ApiException(HttpStatus.OK, "Failed to find the user"));
        myUserRepository.delete(myUser);
    }

    public MyUser findByName(String username) {
        return  myUserRepository.findByName(username).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "user name not found"));
    }

    public boolean isProfileComplete(String name) {
        MyUser user =  myUserRepository.findByName(name).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "User name not found"));
        return user.isProfileCompleted();
    }
}
