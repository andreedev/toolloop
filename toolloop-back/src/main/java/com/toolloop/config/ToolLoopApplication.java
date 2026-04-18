package com.toolloop.config;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.info.License;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@ApplicationPath("/toolloopapi")
@OpenAPIDefinition(
        tags = {
                @Tag(name="api", description="Api operations.")
        },
        info = @Info(
                title="Toolloop API",
                version = "2.0.0",
                contact = @Contact(
                        name = "Student",
                        url = "none",
                        email = "myemail@gmail.com"),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0.html"))
)
public class ToolLoopApplication extends Application {
}
