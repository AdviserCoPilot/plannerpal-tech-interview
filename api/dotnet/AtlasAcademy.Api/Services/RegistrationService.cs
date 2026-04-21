using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Exceptions;
using AtlasAcademy.Api.Models;

namespace AtlasAcademy.Api.Services;

public class RegistrationService(IAtlasRepository repo) : IRegistrationService
{
    public Task<IEnumerable<Registration>> FindByParentAsync(Guid parentId) =>
        repo.GetRegistrationsByParentAsync(parentId);

    public Task<IEnumerable<AdminRegistration>> FindAllAsync() =>
        repo.GetAllRegistrationsAsync();

    public async Task RegisterAsync(Guid classId, Guid parentId)
    {
        if (!await repo.ParentExistsAsync(parentId))
            throw new NotFoundException("Parent not found");

        var outcome = await repo.RegisterWithLockAsync(classId, parentId);
        switch (outcome)
        {
            case RegisterOutcome.ClassNotFound:
                throw new NotFoundException("Class not found");
            case RegisterOutcome.ClassFull:
                throw new ConflictException("Class is full");
        }
    }

    public async Task CancelAsync(Guid id)
    {
        if (!await repo.CancelRegistrationAsync(id))
            throw new NotFoundException("Registration not found");
    }
}
