package com.atlas.academy;

import com.atlas.academy.controller.ClassController;
import com.atlas.academy.exception.NotFoundException;
import com.atlas.academy.model.ClassDto;
import com.atlas.academy.service.ClassService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ClassController.class)
class ClassControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClassService classService;

    private ClassDto sampleDto(String name, int capacity, long registeredCount) {
        return new ClassDto(
                UUID.randomUUID(), name, "Beginner yoga", capacity,
                OffsetDateTime.now(), OffsetDateTime.now().plusHours(1), OffsetDateTime.now(),
                registeredCount
        );
    }

    @Test
    void listClasses() throws Exception {
        when(classService.list()).thenReturn(List.of(sampleDto("Yoga 101", 20, 5)));

        mockMvc.perform(get("/classes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Yoga 101"))
                .andExpect(jsonPath("$[0].capacity").value(20))
                .andExpect(jsonPath("$[0].registered_count").value(5));
    }

    @Test
    void getClassById() throws Exception {
        ClassDto dto = sampleDto("Yoga 101", 20, 0);
        when(classService.findById(dto.id())).thenReturn(dto);

        mockMvc.perform(get("/classes/" + dto.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga 101"));
    }

    @Test
    void getClassNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(classService.findById(id)).thenThrow(new NotFoundException("Class not found"));

        mockMvc.perform(get("/classes/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Class not found"));
    }
}
