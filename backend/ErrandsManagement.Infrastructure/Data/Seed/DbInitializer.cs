using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Data.Seed
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // Avoid re-seeding if data already exists
            if (context.Requests.Any())
                return;
            var requester1 = new Guid();
            var requester2 = new Guid();
            var courier1 = new Guid();
            var courier2 = new Guid();
            // Seed addresses
            var address1 = new Address("123 Main St", "Springfield", "12345", "USA", "Apt 4B");
            var address2 = new Address("456 Oak Ave", "Shelbyville", "67890", "USA");
            var address3 = new Address("789 Pine Rd", "Capital City", "13579", "USA");

            // Create requests in different statuses
            var requests = new List<Request>();

            // 1. Pending request
            var pendingRequest = new Request(
                title: "Fix leaking faucet",
                description: "The kitchen faucet is leaking and needs repair.",
                requesterId: requester1,
                deliveryAddress: address1,
                priority: PriorityLevel.Normal,
                deadline: DateTime.UtcNow.AddDays(5),
                estimatedCost: 50.00m
            );
            requests.Add(pendingRequest);

            // 2. Assigned request
            var assignedRequest = new Request(
                title: "Deliver package",
                description: "Urgent package delivery to downtown office.",
                requesterId: requester2,
                deliveryAddress: address2,
                priority: PriorityLevel.High,
                deadline: DateTime.UtcNow.AddDays(1),
                estimatedCost: 20.00m
            );
            assignedRequest.Assign(courier1);
            requests.Add(assignedRequest);

            // 3. InProgress request
            var inProgressRequest = new Request(
                title: "Grocery shopping",
                description: "Buy groceries for the week: list attached.",
                requesterId: requester1,
                deliveryAddress: address1,
                priority: PriorityLevel.Low,
                deadline: DateTime.UtcNow.AddDays(2),
                estimatedCost: 100.00m
            );
            inProgressRequest.Assign(courier2);
            inProgressRequest.Start();
            requests.Add(inProgressRequest);

            // 4. Completed request
            var completedRequest = new Request(
                title: "Pick up dry cleaning",
                description: "Pick up dry cleaning from Main Street cleaners.",
                requesterId: requester2,
                deliveryAddress: address2,
                priority: PriorityLevel.Normal,
                deadline: DateTime.UtcNow.AddDays(-1),
                estimatedCost: 15.00m
            );
            completedRequest.Assign(courier1);
            completedRequest.Start();
            completedRequest.Complete(15.00m, "Delivered on time");
            requests.Add(completedRequest);

            // 5. Cancelled request
            var cancelledRequest = new Request(
                title: "Plumbing repair",
                description: "Fix bathroom sink.",
                requesterId: requester1,
                deliveryAddress: address1,
                priority: PriorityLevel.Normal,
                deadline: DateTime.UtcNow.AddDays(3),
                estimatedCost: 80.00m
            );
            cancelledRequest.Cancel("Requester changed mind");
            requests.Add(cancelledRequest);

            // 6. Completed request with survey
            var surveyedRequest = new Request(
                title: "Car wash service",
                description: "Mobile car wash at home.",
                requesterId: requester2,
                deliveryAddress: address2,
                priority: PriorityLevel.Low,
                deadline: DateTime.UtcNow.AddDays(-2),
                estimatedCost: 30.00m
            );
            surveyedRequest.Assign(courier2);
            surveyedRequest.Start();
            surveyedRequest.Complete(30.00m, "Car washed");
            surveyedRequest.SubmitSurvey(5, "Excellent service!");
            requests.Add(surveyedRequest);

            context.Requests.AddRange(requests);
            context.SaveChanges();
        }
    }
}