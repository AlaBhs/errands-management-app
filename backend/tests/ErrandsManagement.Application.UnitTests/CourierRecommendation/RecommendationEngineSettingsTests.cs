using ErrandsManagement.Application.CourierRecommendation.Settings;
using FluentAssertions;

namespace ErrandsManagement.Application.UnitTests.CourierRecommendation;

public class RecommendationEngineSettingsTests
{
    [Fact]
    public void Weights_InvalidWeights_ThrowsOnValidate()
    {
        var w = new PriorityWeights
        {
            AvailabilityWeight = 0.50,
            ProximityWeight = 0.50,
            PerformanceWeight = 0.50
        };

        var act = () => w.Validate();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Weights_ValidNormalPriority_DoesNotThrow()
    {
        var w = new PriorityWeights
        {
            AvailabilityWeight = 0.40,
            ProximityWeight = 0.35,
            PerformanceWeight = 0.25
        };

        var act = () => w.Validate();
        act.Should().NotThrow();
    }

    [Fact]
    public void Weights_ValidUrgentPriority_DoesNotThrow()
    {
        var w = new PriorityWeights
        {
            AvailabilityWeight = 0.60,
            ProximityWeight = 0.25,
            PerformanceWeight = 0.15
        };

        var act = () => w.Validate();
        act.Should().NotThrow();
    }
}