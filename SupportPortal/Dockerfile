# ============================================
# Stage 1 — Build the React frontend
# ============================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ============================================
# Stage 2 — Build the .NET backend
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY SupportPortal/SupportPortal.csproj ./SupportPortal/
RUN dotnet restore SupportPortal/SupportPortal.csproj

# Copy the rest of the source code
COPY SupportPortal/ ./SupportPortal/

# Copy the React build output into wwwroot so .NET serves it as static files
COPY --from=frontend-build /app/frontend/dist ./SupportPortal/wwwroot

# Build and publish in Release mode
WORKDIR /src/SupportPortal
RUN dotnet publish -c Release -o /app/publish

# ============================================
# Stage 3 — Runtime
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
