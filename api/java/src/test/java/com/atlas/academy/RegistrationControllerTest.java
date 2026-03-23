package com.atlas.academy;

import com.atlas.academy.controller.RegistrationController;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.model.Parent;
import com.atlas.academy.model.Registration;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.ParentJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
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
    private RegistrationJpaRepository registrationRepo;

    @MockitoBean
    private ClassJpaRepository classRepo;

    @MockitoBean
    private ParentJpaRepository parentRepo;

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

        ClassEntity cls = new ClassEntity();
        cls.setId(classId);
        cls.setName("Yoga 101");

        Parent parent = new Parent();
        parent.setId(parentId);

        Registration reg = new Registration(regId, cls, parent, "registered", OffsetDateTime.now());

        when(registrationRepo.findByParentIdAndStatusRegistered(parentId)).thenReturn(List.of(reg));

        mockMvc.perform(get("/registrations").param("parentId", parentId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrations[0].class_name").value("Yoga 101"))
                .andExpect(jsonPath("$.registrations[0].status").value("registered"));
    }

    @Test
    void getAllRegistrations() throws Exception {
        UUID regId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();

        ClassEntity cls = new ClassEntity();
        cls.setId(classId);
        cls.setName("Yoga 101");

        Parent parent = new Parent(parentId, "alice@example.com", "Alice Smith");

        Registration reg = new Registration(regId, cls, parent, "registered", OffsetDateTime.now());

        when(registrationRepo.findAllRegisteredWithDetails()).thenReturn(List.of(reg));

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
        when(classRepo.findCapacityByIdForUpdate(classId)).thenReturn(null);

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
        when(classRepo.findCapacityByIdForUpdate(classId)).thenReturn(20);
        when(registrationRepo.countByClassEntityIdAndStatus(classId, "registered")).thenReturn(5L);
        when(registrationRepo.findByClassIdAndParentId(classId, parentId)).thenReturn(null);

        ClassEntity classRef = new ClassEntity();
        classRef.setId(classId);
        when(classRepo.getReferenceById(classId)).thenReturn(classRef);

        Parent parentRef = new Parent();
        parentRef.setId(parentId);
        when(parentRepo.getReferenceById(parentId)).thenReturn(parentRef);

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("registered"))
                .andExpect(jsonPath("$.message").value("Successfully registered for class"));

        verify(registrationRepo).save(any(Registration.class));
    }

    @Test
    void registerClassFull() throws Exception {
        UUID classId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        when(classRepo.findCapacityByIdForUpdate(classId)).thenReturn(2);
        when(registrationRepo.countByClassEntityIdAndStatus(classId, "registered")).thenReturn(2L);

        mockMvc.perform(post("/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"classId": "%s", "parentId": "%s"}
                                """.formatted(classId, parentId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Class is full"));

        verify(registrationRepo, never()).save(any());
    }

    @Test
    void cancelSuccess() throws Exception {
        UUID regId = UUID.randomUUID();
        when(registrationRepo.existsByIdAndStatus(regId, "registered")).thenReturn(true);

        Registration reg = new Registration();
        reg.setId(regId);
        reg.setStatus("registered");
        when(registrationRepo.getReferenceById(regId)).thenReturn(reg);

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration cancelled"));

        verify(registrationRepo).save(any(Registration.class));
    }

    @Test
    void cancelNotFound() throws Exception {
        UUID regId = UUID.randomUUID();
        when(registrationRepo.existsByIdAndStatus(regId, "registered")).thenReturn(false);

        mockMvc.perform(delete("/registrations/" + regId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Registration not found"));
    }
}
