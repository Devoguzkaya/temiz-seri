package com.temizseri.weight;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/weights")
public class WeightController {

    private final WeightRepository weights;
    private final Clock clock;

    public WeightController(WeightRepository weights, Clock clock) {
        this.weights = weights;
        this.clock = clock;
    }

    /** from/to verilmezse tüm kayıtlar, eskiden yeniye. */
    @GetMapping
    public List<WeightDto> list(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<WeightEntry> entries = from == null && to == null
                ? weights.findAllByOrderByDateAsc()
                : weights.findByDateBetweenOrderByDateAsc(
                        from != null ? from : LocalDate.of(1970, 1, 1),
                        to != null ? to : LocalDate.now(clock).plusDays(1));
        return entries.stream().map(WeightDto::of).toList();
    }

    @PutMapping("/{date}")
    @Transactional
    public WeightDto save(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today,
                          @Valid @RequestBody WeightRequest body) {
        LocalDate now = today != null ? today : LocalDate.now(clock);
        if (date.isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gelecek bir güne kilo girilemez.");
        }
        BigDecimal kg = body.kg().setScale(1, RoundingMode.HALF_UP);
        WeightEntry entry = weights.findByDate(date).orElseGet(() -> new WeightEntry(date, kg));
        entry.setKg(kg);
        return WeightDto.of(weights.save(entry));
    }

    @DeleteMapping("/{date}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        weights.findByDate(date).ifPresent(weights::delete);
        return ResponseEntity.noContent().build();
    }

    public record WeightRequest(
            @NotNull @DecimalMin(value = "20", message = "Kilo 20 ile 400 arasında olmalı.")
            @DecimalMax(value = "400", message = "Kilo 20 ile 400 arasında olmalı.") BigDecimal kg) {
    }

    public record WeightDto(LocalDate date, BigDecimal kg) {
        static WeightDto of(WeightEntry e) {
            return new WeightDto(e.getDate(), e.getKg());
        }
    }
}
