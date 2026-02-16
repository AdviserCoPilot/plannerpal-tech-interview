using System.Text.Json;
using AtlasAcademy.Api.Data;

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
builder.Services.AddSingleton<IAtlasRepository>(new PostgresRepository(connectionString));

var port = Environment.GetEnvironmentVariable("PORT") ?? "4000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

app.UseCors();
app.MapControllers();
app.Run();

static string ParseConnectionString(string? url)
{
    if (string.IsNullOrEmpty(url))
        return "Host=localhost;Port=5432;Database=atlas_academy;Username=atlas;Password=atlas";

    // Parse postgresql://user:pass@host:port/db
    var uri = new Uri(url.Replace("postgresql://", "http://"));
    var userInfo = uri.UserInfo.Split(':');
    return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]}";
}

public partial class Program { }
