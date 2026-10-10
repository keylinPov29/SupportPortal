# Etapa 1: Compilar el frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Etapa 2: Compilar el backend e integrar el frontend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY SupportPortal/*.csproj ./
RUN dotnet restore
COPY SupportPortal/ ./
# Copiar el build del frontend a wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot
RUN dotnet publish -c Release -o /app/publish

# Etapa 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_URLS=http://+:${PORT}
ENTRYPOINT ["dotnet", "SupportPortal.dll"]