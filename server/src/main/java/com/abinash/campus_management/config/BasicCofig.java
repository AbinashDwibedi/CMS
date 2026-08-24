package com.abinash.campus_management.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BasicCofig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
