package com.atlas.academy;

import com.atlas.academy.controller.ParentController;
import com.atlas.academy.model.Parent;
import com.atlas.academy.repository.ParentJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ParentController.class)
class ParentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ParentJpaRepository parentRepo;

    @Test
    void listParents() throws Exception {
        UUID id = UUID.randomUUID();
        when(parentRepo.findAllByOrderByNameAsc()).thenReturn(List.of(
                new Parent(id, "alice@example.com", "Alice Smith")
        ));

        mockMvc.perform(get("/parents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alice Smith"))
                .andExpect(jsonPath("$[0].email").value("alice@example.com"));
    }

    @Test
    void listParentsServerError() throws Exception {
        when(parentRepo.findAllByOrderByNameAsc()).thenThrow(new RuntimeException("DB down"));

        mockMvc.perform(get("/parents"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Unexpected error"));
    }
}
