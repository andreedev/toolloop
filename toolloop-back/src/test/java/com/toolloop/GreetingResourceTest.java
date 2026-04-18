package com.toolloop;

import com.toolloop.model.entity.User;
import com.toolloop.model.dto.HttpBodyResponse;
import com.toolloop.service.AuthService;
import io.quarkus.test.junit.QuarkusTest;
import javax.inject.Inject;
import javax.ws.rs.core.HttpHeaders;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class GreetingResourceTest {

    @Inject
    AuthService authService;

    private static String token;

    private void auth(){
        var response = authService.loginUser(User.builder()
                    .email("admin@gmail.com")
                    .password("12345678")
                .build());
        var httpBodyResponse = (HttpBodyResponse) response.getEntity();
        token = "Bearer "+httpBodyResponse.getData().toString();
    }

    @Disabled
    @Test
    public void shouldReturn401IfInvalidSession(){
        given()
        .header(HttpHeaders.AUTHORIZATION, "Bearer null")
          .when()
                .get("toolloopapi/auth/checkSession")
          .then()
             .statusCode(401);

        given()
                .when()
                .get("toolloopapi/auth/checkSession")
                .then()
                .statusCode(401);
    }


}