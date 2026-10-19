package com.temizseri.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    Clock clock(@Value("${app.zone}") String zone) {
        return Clock.system(ZoneId.of(zone));
    }

    @Bean
    WebMvcConfigurer cors(@Value("${app.cors-origins}") String[] origins) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "PUT", "DELETE");
            }
        };
    }
}
