package com.atlas.academy;

import com.atlas.academy.controller.RegistrationController;
import com.atlas.academy.exception.ConflictException;
import com.atlas.academy.exception.NotFoundException;
import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.RegistrationDto;
import com.atlas.academy.model.RegistrationResult;
import com.atlas.academy.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistrationService registrationService;

    @Test
    void getRegistrationsRequiresParentId() throws Exception {
        mockMvc.perform(get("/registrations"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("parentId is required"));
    }

    @Test
    void getRegistrationsWithParentId() throws Exception {
        UUID parentId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        RegistrationDto dto = new RegistrationDto(UUID.randomUUID(), classId, "registered", "Yoga 101");
        when(registrationService.findByParent(parentId)).thenReturn(List.of(dto));

        mockMvc.perform(get("/registrations").param("parentId", parentId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrations[0].class_name").value("Yoga 101"))
                .andExpect(jsonPath("$.registrations[0].status").value("registered"));
    }

    @Test
    void getAllRegistrations() throws Exception {
        AdminRegistration dto = new AdminRegistration(
                UUID.randomUUID(), UUID.randomUUID(), "Yoga 101",
                "Alice Smith", "alice@example.com", OffsetDateTime.now()
        );
        when(registrationService.findAll()).thenReturn(List.of(dto));

        mockMvc.perform(get("/registrations/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].class_name").value("Yoga 101"))
                .andExpect(jsonPath("$[0].parent_name").value("Alice Smith"));
    }

    @Test
    void registerMissingFields() throws Exception {
        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerClassNotFound() throws Exception {
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        when(registrationService.register(classId, parentId))
                .thenThrow(new NotFoundException("Class not found"));

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Class not found"));
    }

    @Test
    void registerSuccess() throws Exception {
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        when(registrationService.register(classId, parentId))
                .thenReturn(new RegistrationResult("registered", "Successfully registered for class"));

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("registered"))
                .andExpect(jsonPath("$.message").value("Successfully registered for class"));
    }

    @Test
    void registerClassFull() throws Exception {
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        when(registrationService.register(classId, parentId))
                .thenThrow(new ConflictException("Class is full"));

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Class is full"));
    }

    @Test
    void cancelSuccess() throws Exception {
        UUID regId = UUID.randomUUID();

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration cancelled"));

        verify(registrationService).cancel(regId);
    }

    @Test
    void cancelNotFound() throws Exception {
        UUID regId = UUID.randomUUID();
        doThrow(new NotFoundException("Registration not found"))
                .when(registrationService).cancel(eq(regId));

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Registration not found"));
    }
}
