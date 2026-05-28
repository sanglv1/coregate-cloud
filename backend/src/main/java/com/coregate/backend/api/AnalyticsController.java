package com.coregate.backend.api;

import com.coregate.backend.api.dto.AnalyticsDtos;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping
    public AnalyticsDtos.AnalyticsResponse analytics(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
    ) {
        LocalDate end = endDate == null ? LocalDate.now() : LocalDate.parse(endDate);
        List<AnalyticsDtos.AnalyticsPoint> points = List.of(
            new AnalyticsDtos.AnalyticsPoint(UUID.randomUUID().toString(), end.minusDays(2).toString(), 100, 4, 400000L, 4),
            new AnalyticsDtos.AnalyticsPoint(UUID.randomUUID().toString(), end.minusDays(1).toString(), 140, 6, 600000L, 6),
            new AnalyticsDtos.AnalyticsPoint(UUID.randomUUID().toString(), end.toString(), 120, 5, 500000L, 5)
        );
        long revenue = points.stream().mapToLong(AnalyticsDtos.AnalyticsPoint::revenue).sum();
        int purchases = points.stream().mapToInt(AnalyticsDtos.AnalyticsPoint::purchases).sum();
        int downloads = points.stream().mapToInt(AnalyticsDtos.AnalyticsPoint::downloadCount).sum();
        int views = points.stream().mapToInt(AnalyticsDtos.AnalyticsPoint::views).sum();
        return new AnalyticsDtos.AnalyticsResponse(
            points,
            new AnalyticsDtos.AnalyticsSummary(
                revenue,
                purchases,
                downloads,
                views,
                revenue / (double) points.size(),
                purchases / (double) points.size()
            )
        );
    }
}
