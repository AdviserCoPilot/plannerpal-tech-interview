using AtlasAcademy.Api.Models;
using Npgsql;

namespace AtlasAcademy.Api.Data;

public class PostgresRepository : IAtlasRepository
{
    private readonly string _connectionString;

    public PostgresRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    private NpgsqlConnection CreateConnection() => new(_connectionString);

    public async Task<IEnumerable<Parent>> GetParentsAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "SELECT id, email, name FROM parents ORDER BY name", conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        var parents = new List<Parent>();
        while (await reader.ReadAsync())
        {
            parents.Add(new Parent(
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2)
            ));
        }
        return parents;
    }

    public async Task<IEnumerable<ClassEntity>> GetClassesAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("""
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            ORDER BY c.start_time ASC
            """, conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await ReadClasses(reader);
    }

    public async Task<ClassEntity?> GetClassByIdAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("""
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            WHERE c.id = @id
            """, conn);
        cmd.Parameters.AddWithValue("id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        var classes = await ReadClasses(reader);
        return classes.FirstOrDefault();
    }

    public async Task<int> GetClassCapacityAsync(Guid classId)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "SELECT capacity FROM classes WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("id", classId);
        var result = await cmd.ExecuteScalarAsync();
        return result is null ? -1 : Convert.ToInt32(result);
    }

    public async Task<IEnumerable<Registration>> GetRegistrationsByParentAsync(Guid parentId)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("""
            SELECT r.id, r.class_id, r.status, c.name as class_name
            FROM registrations r
            JOIN classes c ON c.id = r.class_id
            WHERE r.parent_id = @parentId AND r.status = 'registered'
            ORDER BY c.start_time
            """, conn);
        cmd.Parameters.AddWithValue("parentId", parentId);
        await using var reader = await cmd.ExecuteReaderAsync();

        var registrations = new List<Registration>();
        while (await reader.ReadAsync())
        {
            registrations.Add(new Registration(
                reader.GetGuid(0),
                reader.GetGuid(1),
                reader.GetString(2),
                reader.GetString(3)
            ));
        }
        return registrations;
    }

    public async Task<IEnumerable<AdminRegistration>> GetAllRegistrationsAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("""
            SELECT r.id, r.class_id, c.name as class_name,
                   p.name as parent_name, p.email as parent_email,
                   r.created_at
            FROM registrations r
            JOIN classes c ON c.id = r.class_id
            JOIN parents p ON p.id = r.parent_id
            WHERE r.status = 'registered'
            ORDER BY c.start_time, p.name
            """, conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        var registrations = new List<AdminRegistration>();
        while (await reader.ReadAsync())
        {
            registrations.Add(new AdminRegistration(
                reader.GetGuid(0),
                reader.GetGuid(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetDateTime(5)
            ));
        }
        return registrations;
    }

    public async Task<long> CountRegisteredAsync(Guid classId)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "SELECT COUNT(*) FROM registrations WHERE class_id = @classId AND status = 'registered'",
            conn);
        cmd.Parameters.AddWithValue("classId", classId);
        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt64(result);
    }

    public async Task RegisterAsync(Guid classId, Guid parentId)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("""
            INSERT INTO registrations (class_id, parent_id, status)
            VALUES (@classId, @parentId, 'registered')
            ON CONFLICT (class_id, parent_id)
            DO UPDATE SET status = 'registered'
            """, conn);
        cmd.Parameters.AddWithValue("classId", classId);
        cmd.Parameters.AddWithValue("parentId", parentId);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<bool> RegistrationExistsActiveAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "SELECT COUNT(*) FROM registrations WHERE id = @id AND status = 'registered'",
            conn);
        cmd.Parameters.AddWithValue("id", id);
        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt64(result) > 0;
    }

    public async Task CancelRegistrationAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand(
            "UPDATE registrations SET status = 'cancelled' WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task<List<ClassEntity>> ReadClasses(NpgsqlDataReader reader)
    {
        var classes = new List<ClassEntity>();
        while (await reader.ReadAsync())
        {
            classes.Add(new ClassEntity(
                reader.GetGuid(reader.GetOrdinal("id")),
                reader.GetString(reader.GetOrdinal("name")),
                reader.IsDBNull(reader.GetOrdinal("description"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("description")),
                reader.GetInt32(reader.GetOrdinal("capacity")),
                reader.GetDateTime(reader.GetOrdinal("start_time")),
                reader.GetDateTime(reader.GetOrdinal("end_time")),
                reader.GetDateTime(reader.GetOrdinal("created_at")),
                reader.GetInt64(reader.GetOrdinal("registered_count"))
            ));
        }
        return classes;
    }
}
