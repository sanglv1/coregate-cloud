package com.coregate.backend.api.dto;

import java.util.List;

public class AnalyticsDtos {
    public record AnalyticsPoint(
        String id,
        String date,
        Integer views,
        Integer purchases,
        Long revenue,
        Integer downloadCount
    ) {}

    public record AnalyticsSummary(
        Long totalRevenue,
        Integer totalPurchases,
        Integer totalDownloads,
        Integer totalViews,
        Double averageRevenue,
        Double averagePurchasesPerDay
    ) {}

    public record AnalyticsResponse(List<AnalyticsPoint> data, AnalyticsSummary summary) {}
}
