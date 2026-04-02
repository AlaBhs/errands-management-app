# =========================
# BUILD STAGE
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ErrandsManagement.API/ErrandsManagement.API.csproj", "ErrandsManagement.API/"]
COPY ["ErrandsManagement.Application/ErrandsManagement.Application.csproj", "ErrandsManagement.Application/"]
COPY ["ErrandsManagement.Domain/ErrandsManagement.Domain.csproj", "ErrandsManagement.Domain/"]
COPY ["ErrandsManagement.Infrastructure/ErrandsManagement.Infrastructure.csproj", "ErrandsManagement.Infrastructure/"]

RUN dotnet restore "ErrandsManagement.API/ErrandsManagement.API.csproj"

COPY . .

WORKDIR "/src/ErrandsManagement.API"
RUN dotnet publish -c Release -o /app/publish

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "ErrandsManagement.API.dll"]