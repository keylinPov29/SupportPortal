# ============================================
# Stage 1 — Build
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY SupportPortal/SupportPortal.csproj ./SupportPortal/
RUN dotnet restore SupportPortal/SupportPortal.csproj

# Copy the rest of the source code
COPY SupportPortal/ ./SupportPortal/

# Build and publish in Release mode
WORKDIR /src/SupportPortal
RUN dotnet publish -c Release -o /app/publish

# ============================================
# Stage 2 — Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish ./

# Railway expects the app to listen on port 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "SupportPortal.dll"]
