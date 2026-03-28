using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Domain.Common;

/// <summary>
/// Marker interface for domain events. Implements INotification
/// so MediatR can dispatch them to registered handlers.
/// </summary>
public interface IDomainEvent : INotification { }