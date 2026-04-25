package com.rescuenav.backend.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI rescueNavOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Rescue_Nav Backend API")
                        .version("1.0.0")
                        .description("Business logic and external integration APIs for Rescue_Nav."));
    }
}
