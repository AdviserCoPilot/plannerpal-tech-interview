package com.atlas.academy;

import com.atlas.academy.controller.RegistrationController;
import com.atlas.academy.model.AdminRegistration;
import com.atlas.academy.model.Registration;
import com.atlas.academy.repository.ClassRepository;
import com.atlas.academy.repository.RegistrationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegistrationRepository registrationRepo;

    @MockitoBean
    private ClassRepository classRepo;

    @Test
    void getRegistrationsRequiresParentId() throws Exception {
        mockMvc.perform(get("/registrations"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("parentId is required"));
    }

    @Test
    void getRegistrationsWithParentId() throws Exception {
        UUID parentId = UUID.randomUUID();
        UUID regId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        when(registrationRepo.findByParent(parentId)).thenReturn(List.of(
                new Registration(regId, classId, "registered", "Yoga 101")
        ));

        mockMvc.perform(get("/registrations").param("parentId", parentId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrations[0].class_name").value("Yoga 101"))
                .andExpect(jsonPath("$.registrations[0].status").value("registered"));
    }

    @Test
    void getAllRegistrations() throws Exception {
        when(registrationRepo.findAll()).thenReturn(List.of(
                new AdminRegistration(
                        UUID.randomUUID(), UUID.randomUUID(), "Yoga 101",
                        "Alice Smith", "alice@example.com", OffsetDateTime.now()
                )
        ));

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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("classId and parentId are required"));
    }

    @Test
    void registerClassNotFound() throws Exception {
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        when(classRepo.getCapacity(classId)).thenReturn(-1);

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
        when(classRepo.getCapacity(classId)).thenReturn(20);
        when(registrationRepo.countRegistered(classId)).thenReturn(5L);

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("registered"))
                .andExpect(jsonPath("$.message").value("Successfully registered for class"));

        verify(registrationRepo).register(classId, parentId);
    }

    @Test
    void cancelSuccess() throws Exception {
        UUID regId = UUID.randomUUID();
        when(registrationRepo.existsActive(regId)).thenReturn(true);

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration cancelled"));

        verify(registrationRepo).cancel(regId);
    }

    @Test
    void cancelNotFound() throws Exception {
        UUID regId = UUID.randomUUID();
        when(registrationRepo.existsActive(regId)).thenReturn(false);

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Registration not found"));
    }
}
