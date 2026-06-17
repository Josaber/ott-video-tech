package com.example.vod;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OttVideoDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(OttVideoDemoApplication.class, args);
    }
}
