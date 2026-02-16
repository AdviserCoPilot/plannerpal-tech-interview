package com.atlas.academy;

import com.atlas.academy.controller.ClassController;
import com.atlas.academy.model.ClassEntity;
import com.atlas.academy.repository.ClassRepository;
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
    private ClassRepository classRepo;

    private ClassEntity sampleClass() {
        return new ClassEntity(
                UUID.randomUUID(),
                "Yoga 101",
                "Beginner yoga",
                20,
                OffsetDateTime.now(),
                OffsetDateTime.now().plusHours(1),
                OffsetDateTime.now(),
                5
        );
    }

    @Test
    void listClasses() throws Exception {
        when(classRepo.findAll()).thenReturn(List.of(sampleClass()));

        mockMvc.perform(get("/classes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Yoga 101"))
                .andExpect(jsonPath("$[0].capacity").value(20))
                .andExpect(jsonPath("$[0].registered_count").value(5));
    }

    @Test
    void getClassById() throws Exception {
        ClassEntity cls = sampleClass();
        when(classRepo.findById(cls.id())).thenReturn(Optional.of(cls));

        mockMvc.perform(get("/classes/" + cls.id()))
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
