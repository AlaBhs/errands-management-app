namespace ErrandsManagement.Domain.ValueObjects;

/// <summary>
/// Pure scoring calculations for the courier recommendation engine.
/// No infrastructure dependencies — fully unit testable.
/// </summary>
public static class CourierScoring
{
    public static double ComputeAvailabilityScore(int activeCount, int maxActive)
    {
        if (maxActive <= 0) return 0;
        return Math.Max(0, (1.0 - (double)activeCount / maxActive) * 100.0);
    }

    public static double ComputeProximityScore(
        double? courierLat, double? courierLng,
        double? deliveryLat, double? deliveryLng,
        double maxDistanceKm,
        out double? distanceKm)
    {
        if (deliveryLat is null || deliveryLng is null)
        {
            distanceKm = null;
            return 50.0;
        }

        if (courierLat is null || courierLng is null)
        {
            distanceKm = null;
            return 0.0;
        }

        distanceKm = Haversine(
            courierLat.Value, courierLng.Value,
            deliveryLat.Value, deliveryLng.Value);

        return Math.Max(0, (1.0 - distanceKm.Value / maxDistanceKm) * 100.0);
    }

    public static double ComputePerformanceScore(
        int totalAssignments,
        int completed,
        double? avgRating)
    {
        if (totalAssignments == 0)
            return 50.0; // new courier — neutral

        var normalizedRating = avgRating.HasValue
            ? (avgRating.Value / 5.0) * 100.0
            : 50.0;

        var completionRate = (double)completed / totalAssignments * 100.0;

        return normalizedRating * 0.5 + completionRate * 0.5;
    }

    public static double Haversine(
        double lat1, double lon1,
        double lat2, double lon2)
    {
        const double R = 6371.0;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double degrees) => degrees * Math.PI / 180.0;
}