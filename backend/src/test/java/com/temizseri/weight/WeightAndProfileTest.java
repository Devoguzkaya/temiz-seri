package com.temizseri.weight;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class WeightAndProfileTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    WeightRepository weights;

    @BeforeEach
    void reset() {
        weights.deleteAll();
    }

    private void putWeight(String date, String kg) throws Exception {
        mvc.perform(put("/api/weights/" + date).param("today", "2026-10-19")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"kg\":" + kg + "}"))
                .andExpect(status().isOk());
    }

    @Test
    void savesUpdatesListsAndDeletesWeights() throws Exception {
        putWeight("2026-10-18", "92.46");
        putWeight("2026-10-10", "94");
        putWeight("2026-10-18", "92.3"); // aynı gün güncellenir

        mvc.perform(get("/api/weights"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].date").value("2026-10-10"))
                .andExpect(jsonPath("$[1].kg").value(92.3));

        mvc.perform(get("/api/weights").param("from", "2026-10-15").param("to", "2026-10-19"))
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(delete("/api/weights/2026-10-10")).andExpect(status().isNoContent());
        mvc.perform(get("/api/weights")).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void rejectsOutOfRangeAndFutureWeights() throws Exception {
        mvc.perform(put("/api/weights/2026-10-19").param("today", "2026-10-19")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"kg\":5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Kilo 20 ile 400 arasında olmalı."));

        mvc.perform(put("/api/weights/2026-10-20").param("today", "2026-10-19")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"kg\":80}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void savesProfile() throws Exception {
        mvc.perform(put("/api/profile").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goalKg\":80,\"heightCm\":178}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/profile"))
                .andExpect(jsonPath("$.goalKg").value(80.0))
                .andExpect(jsonPath("$.heightCm").value(178));

        mvc.perform(put("/api/profile").contentType(MediaType.APPLICATION_JSON).content("{\"heightCm\":20}"))
                .andExpect(status().isBadRequest());
    }
}
