package com.atlas.academy;

import com.atlas.academy.controller.ClassController;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.repository.ClassJpaRepository;
import com.atlas.academy.repository.RegistrationJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClassController.class)
class ClassControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClassJpaRepository classRepo;

    @MockitoBean
    private RegistrationJpaRepository registrationRepo;

    private ClassEntity sampleClass() {
        return new ClassEntity(
                UUID.randomUUID(),
                "Yoga 101",
                "Beginner yoga",
                20,
                OffsetDateTime.now(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now()
        );
    }

    @Test
    void listClasses() throws Exception {
        ClassEntity cls = sampleClass();
        when(classRepo.findAllByOrderByStartTimeAsc()).thenReturn(List.of(cls));
        when(registrationRepo.countRegisteredGroupedByClassId()).thenReturn(List.<Object[]>of(new Object[]{cls.getId(), 5L}));

        mockMvc.perform(get("/classes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Yoga 101"))
                .andExpect(jsonPath("$[0].capacity").value(20))
                .andExpect(jsonPath("$[0].registered_count").value(5));
    }

    @Test
    void getClassById() throws Exception {
        ClassEntity cls = sampleClass();
        when(classRepo.findById(cls.getId())).thenReturn(Optional.of(cls));
        when(registrationRepo.countByClassEntityIdAndStatus(cls.getId(), "registered")).thenReturn(0L);

        mockMvc.perform(get("/classes/" + cls.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga 101"));
    }

    @Test
    void getClassNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(classRepo.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/classes/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Class not found"));
    }
}
