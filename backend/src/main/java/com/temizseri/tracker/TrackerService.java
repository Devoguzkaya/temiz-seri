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
        Map<LocalDate, Set<Long>> doneByDay = doneByDay(weekStart, today);

        Set<Long> doneToday = doneByDay.getOrDefault(today, Set.of());
        List<Summary.DayScore> week = scores(weekStart, today, doneByDay, all.size());

        int before = streakBefore(today, all.size());
        boolean todayComplete = !all.isEmpty() && doneToday.size() >= all.size();
        return new Summary(today, statuses(all, doneToday), before + (todayComplete ? 1 : 0), before, week);
    }

    @Transactional(readOnly = true)
    public List<Summary.DayScore> range(LocalDate from, LocalDate to) {
        if (from.isAfter(to) || from.plusDays(400).isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tarih aralığı geçersiz (en fazla 400 gün).");
        }
        int total = (int) habits.count();
        return scores(from, to, doneByDay(from, to), total);
    }

    @Transactional(readOnly = true)
    public Summary.DayDetail day(LocalDate day) {
        Set<Long> done = doneByDay(day, day).getOrDefault(day, Set.of());
        return new Summary.DayDetail(day, statuses(habits.findAllByOrderBySortOrderAsc(), done));
    }

    @Transactional(readOnly = true)
    public Summary.Stats stats(LocalDate today) {
        int habitCount = (int) habits.count();
        List<LocalDate> complete = habitCount == 0 ? List.of() : checks.findCompleteDaysUntil(today, habitCount);

        int best = 0;
        int run = 0;
        LocalDate previous = null;
        for (LocalDate d : complete) {
            run = previous != null && previous.plusDays(1).equals(d) ? run + 1 : 1;
            best = Math.max(best, run);
            previous = d;
        }

        LocalDate monthStart = today.withDayOfMonth(1);
        int possible = today.getDayOfMonth() * habitCount;
        int doneThisMonth = doneByDay(monthStart, today).values().stream().mapToInt(Set::size).sum();
        double monthRate = possible == 0 ? 0 : (double) doneThisMonth / possible;

        Set<Long> doneToday = doneByDay(today, today).getOrDefault(today, Set.of());
        int current = streakBefore(today, habitCount) + (habitCount > 0 && doneToday.size() >= habitCount ? 1 : 0);
        return new Summary.Stats(current, best, complete.size(), monthRate, checks.findFirstDay());
    }

    private Map<LocalDate, Set<Long>> doneByDay(LocalDate from, LocalDate to) {
        Map<LocalDate, Set<Long>> doneByDay = new HashMap<>();
        for (HabitCheck c : checks.findByDayBetween(from, to)) {
            doneByDay.computeIfAbsent(c.getDay(), d -> new HashSet<>()).add(c.getHabit().getId());
        }
        return doneByDay;
    }

    private static List<Summary.HabitStatus> statuses(List<Habit> all, Set<Long> done) {
        return all.stream()
                .map(h -> new Summary.HabitStatus(h.getId(), h.getName(), h.getHint(), done.contains(h.getId())))
                .toList();
    }

    private static List<Summary.DayScore> scores(LocalDate from, LocalDate to, Map<LocalDate, Set<Long>> doneByDay, int total) {
        List<Summary.DayScore> scores = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            scores.add(new Summary.DayScore(d, doneByDay.getOrDefault(d, Set.of()).size(), total));
        }
        return scores;
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
