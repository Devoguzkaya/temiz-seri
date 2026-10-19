package com.temizseri.tracker;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.temizseri.habit.Habit;
import com.temizseri.habit.HabitRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class TrackerControllerTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 19);

    @Autowired
    MockMvc mvc;

    @Autowired
    HabitRepository habits;

    @Autowired
    HabitCheckRepository checks;

    List<Habit> all;

    @BeforeEach
    void reset() {
        checks.deleteAll();
        all = habits.findAllByOrderBySortOrderAsc();
    }

    private void complete(LocalDate day, int count) {
        for (int i = 0; i < count; i++) {
            checks.save(new HabitCheck(day, all.get(i)));
        }
    }

    @Test
    void seedsFourHabits() throws Exception {
        mvc.perform(get("/api/summary").param("today", TODAY.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.habits.length()").value(4))
                .andExpect(jsonPath("$.habits[0].name").value("Şekerli içecek yok"))
                .andExpect(jsonPath("$.streak").value(0))
                .andExpect(jsonPath("$.lastSevenDays.length()").value(7))
                .andExpect(jsonPath("$.lastSevenDays[6].date").value("2026-10-19"));
    }

    @Test
    void incompleteTodayDoesNotBreakStreak() throws Exception {
        complete(TODAY.minusDays(1), 4);
        complete(TODAY.minusDays(2), 4);
        complete(TODAY.minusDays(3), 3); // eksik gün seriyi keser
        complete(TODAY.minusDays(4), 4);
        complete(TODAY, 2);

        mvc.perform(get("/api/summary").param("today", TODAY.toString()))
                .andExpect(jsonPath("$.streak").value(2))
                .andExpect(jsonPath("$.streakBeforeToday").value(2))
                .andExpect(jsonPath("$.lastSevenDays[3].done").value(3))
                .andExpect(jsonPath("$.lastSevenDays[6].done").value(2));
    }

    @Test
    void missingYesterdayResetsStreak() throws Exception {
        complete(TODAY.minusDays(2), 4);
        complete(TODAY.minusDays(3), 4);

        mvc.perform(get("/api/summary").param("today", TODAY.toString()))
                .andExpect(jsonPath("$.streak").value(0));
    }

    @Test
    void completingTodayAddsToStreakAndUncheckRemovesIt() throws Exception {
        complete(TODAY.minusDays(1), 4);
        complete(TODAY, 3);
        String url = "/api/days/" + TODAY + "/habits/" + all.get(3).getId();

        mvc.perform(put(url).param("today", TODAY.toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"done\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.streak").value(2))
                .andExpect(jsonPath("$.habits[3].done").value(true));

        mvc.perform(put(url).param("today", TODAY.toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"done\":false}"))
                .andExpect(jsonPath("$.streak").value(1))
                .andExpect(jsonPath("$.habits[3].done").value(false));
    }

    @Test
    void rejectsFutureDays() throws Exception {
        mvc.perform(put("/api/days/" + TODAY.plusDays(1) + "/habits/" + all.get(0).getId())
                        .param("today", TODAY.toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"done\":true}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rangeAndDayDetail() throws Exception {
        complete(TODAY.minusDays(2), 4);
        complete(TODAY.minusDays(1), 1);

        mvc.perform(get("/api/days").param("from", TODAY.minusDays(2).toString()).param("to", TODAY.toString()))
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].done").value(4))
                .andExpect(jsonPath("$[1].done").value(1))
                .andExpect(jsonPath("$[2].done").value(0));

        mvc.perform(get("/api/days/" + TODAY.minusDays(1)))
                .andExpect(jsonPath("$.habits[0].done").value(true))
                .andExpect(jsonPath("$.habits[1].done").value(false));
    }

    @Test
    void editingPastDayRepairsStreak() throws Exception {
        complete(TODAY.minusDays(1), 4);
        complete(TODAY.minusDays(2), 3);
        complete(TODAY.minusDays(3), 4);

        mvc.perform(put("/api/days/" + TODAY.minusDays(2) + "/habits/" + all.get(3).getId())
                        .param("today", TODAY.toString())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"done\":true}"))
                .andExpect(jsonPath("$.streak").value(3));
    }

    @Test
    void statsCountBestStreakAndMonthRate() throws Exception {
        // 1-3 Ekim tam (3 günlük seri), 5 Ekim tam, 18-19 Ekim tam
        for (int d : new int[] {1, 2, 3, 5, 18, 19}) {
            complete(LocalDate.of(2026, 10, d), 4);
        }
        complete(LocalDate.of(2026, 9, 30), 4); // önceki ay: en iyi seriye girer, aylık orana girmez

        mvc.perform(get("/api/stats").param("today", TODAY.toString()))
                .andExpect(jsonPath("$.bestStreak").value(4))
                .andExpect(jsonPath("$.currentStreak").value(2))
                .andExpect(jsonPath("$.cleanDays").value(7))
                .andExpect(jsonPath("$.monthRate").value(24.0 / 76))
                .andExpect(jsonPath("$.firstDay").value("2026-09-30"));
    }
}
