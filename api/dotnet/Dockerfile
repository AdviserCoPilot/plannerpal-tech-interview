FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src
COPY AtlasAcademy.Api/AtlasAcademy.Api.csproj AtlasAcademy.Api/
RUN dotnet restore AtlasAcademy.Api/AtlasAcademy.Api.csproj

COPY AtlasAcademy.Api/ AtlasAcademy.Api/
RUN dotnet publish AtlasAcademy.Api -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 4000

ENTRYPOINT ["dotnet", "AtlasAcademy.Api.dll"]
