using System.Reflection;
using System.Text.Json;
using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Middleware;
using AtlasAcademy.Api.Services;
using DbUp;
using Microsoft.EntityFrameworkCore;

RunMigrations();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = ParseConnectionString(databaseUrl);

builder.Services.AddDbContext<AtlasDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IAtlasRepository, PostgresRepository>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
builder.Services.AddScoped<IParentService, ParentService>();

var port = Environment.GetEnvironmentVariable("PORT") ?? "4000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors();
app.MapControllers();
app.Run();

static string ParseConnectionString(string? url)
{
    if (string.IsNullOrEmpty(url))
        return "Host=localhost;Port=5432;Database=atlas_academy;Username=atlas;Password=atlas";

    var uri = new Uri(url.Replace("postgresql://", "http://"));
    var userInfo = uri.UserInfo.Split(':', 2);
    if (userInfo.Length < 2)
        throw new ArgumentException("Malformed DATABASE_URL: missing password. Expected postgresql://user:pass@host:port/db");
    var port = uri.Port > 0 ? uri.Port : 5432;
    return $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]}";
}

static void RunMigrations()
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (string.IsNullOrEmpty(databaseUrl)) return;

    var connStr = ParseConnectionString(databaseUrl);
    var upgrader = DeployChanges.To
        .PostgresqlDatabase(connStr)
        .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
        .LogToConsole()
        .Build();

    var result = upgrader.PerformUpgrade();
    if (!result.Successful)
        throw result.Error;
}

public partial class Program { }
