package com.temizseri.tracker;

import com.temizseri.habit.Habit;
import com.temizseri.habit.HabitRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TrackerService {

    private final HabitRepository habits;
    private final HabitCheckRepository checks;

    public TrackerService(HabitRepository habits, HabitCheckRepository checks) {
        this.habits = habits;
        this.checks = checks;
    }

    @Transactional(readOnly = true)
    public Summary summary(LocalDate today) {
        List<Habit> all = habits.findAllByOrderBySortOrderAsc();
        LocalDate weekStart = today.minusDays(6);

        Map<LocalDate, Set<Long>> doneByDay = new HashMap<>();
        for (HabitCheck c : checks.findByDayBetween(weekStart, today)) {
            doneByDay.computeIfAbsent(c.getDay(), d -> new HashSet<>()).add(c.getHabit().getId());
        }

        Set<Long> doneToday = doneByDay.getOrDefault(today, Set.of());
        List<Summary.HabitStatus> statuses = all.stream()
                .map(h -> new Summary.HabitStatus(h.getId(), h.getName(), h.getHint(), doneToday.contains(h.getId())))
                .toList();

        List<Summary.DayScore> week = new ArrayList<>(7);
        for (LocalDate d = weekStart; !d.isAfter(today); d = d.plusDays(1)) {
            week.add(new Summary.DayScore(d, doneByDay.getOrDefault(d, Set.of()).size(), all.size()));
        }

        int before = streakBefore(today, all.size());
        boolean todayComplete = !all.isEmpty() && doneToday.size() >= all.size();
        return new Summary(today, statuses, before + (todayComplete ? 1 : 0), before, week);
    }

    /**
     * Dünden geriye doğru kesintisiz tam günleri sayar. Bugün henüz bitmediği için
     * eksik olması seriyi bozmaz; tamamsa summary() bugünü ayrıca ekler.
     */
    int streakBefore(LocalDate today, int habitCount) {
        if (habitCount == 0) {
            return 0;
        }
        int streak = 0;
        LocalDate expected = today.minusDays(1);
        for (LocalDate day : checks.findCompleteDaysBefore(today, habitCount)) {
            if (!day.equals(expected)) {
                break;
            }
            streak++;
            expected = expected.minusDays(1);
        }
        return streak;
    }

    @Transactional
    public Summary setDone(LocalDate day, Long habitId, boolean done, LocalDate today) {
        if (day.isAfter(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gelecek bir gün işaretlenemez.");
        }
        Habit habit = habits.findById(habitId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alışkanlık bulunamadı."));

        boolean exists = checks.existsByDayAndHabitId(day, habitId);
        if (done && !exists) {
            checks.save(new HabitCheck(day, habit));
        } else if (!done && exists) {
            checks.deleteByDayAndHabitId(day, habitId);
        }
        return summary(today);
    }
}
