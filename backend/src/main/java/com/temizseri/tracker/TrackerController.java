package com.temizseri.tracker;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TrackerController {

    private final TrackerService tracker;
    private final Clock clock;

    public TrackerController(TrackerService tracker, Clock clock) {
        this.tracker = tracker;
        this.clock = clock;
    }

    /** today: kullanıcının cihazındaki tarih. Gönderilmezse sunucu saat dilimi kullanılır. */
    @GetMapping("/summary")
    public Summary summary(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today) {
        return tracker.summary(resolve(today));
    }

    /** Takvim için gün gün kaç alışkanlık yapıldığı. */
    @GetMapping("/days")
    public List<Summary.DayScore> range(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return tracker.range(from, to);
    }

    @GetMapping("/days/{day}")
    public Summary.DayDetail day(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day) {
        return tracker.day(day);
    }

    @GetMapping("/stats")
    public Summary.Stats stats(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today) {
        return tracker.stats(resolve(today));
    }

    @PutMapping("/days/{day}/habits/{habitId}")
    public Summary setDone(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate day,
                           @PathVariable Long habitId,
                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today,
                           @Valid @RequestBody CheckRequest body) {
        return tracker.setDone(day, habitId, body.done(), resolve(today));
    }

    private LocalDate resolve(LocalDate today) {
        return today != null ? today : LocalDate.now(clock);
    }

    public record CheckRequest(@NotNull Boolean done) {
    }
}
