using CoopMonitor.API.DTOs;
using CoopMonitor.API.Services.SaaS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ISaaSService _saasService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _env;

    public SettingsController(
        ISaaSService saasService,
        IConfiguration configuration,
        IWebHostEnvironment env)
    {
        _saasService = saasService;
        _configuration = configuration;
        _env = env;
    }

    [HttpGet("status")]
    public async Task<ActionResult<SystemStatusDto>> GetSystemStatus()
    {
        var saasStatus = await _saasService.GetStatusAsync();

        var tgConfig = _configuration.GetSection("Telegram");
        var notifStatus = new NotificationStatusDto(
            TelegramEnabled: tgConfig.GetValue<bool>("Enabled"),
            AdminChatId: tgConfig["AdminChatId"]
        );

        // Mask ChatId for security
        if (!string.IsNullOrEmpty(notifStatus.AdminChatId) && notifStatus.AdminChatId.Length > 4)
        {
            notifStatus = notifStatus with
            {
                AdminChatId = string.Concat(notifStatus.AdminChatId.AsSpan(0, 2), "***", notifStatus.AdminChatId.AsSpan(notifStatus.AdminChatId.Length - 2))
            };
        }

        return Ok(new SystemStatusDto(
            AppVersion: "1.0.0",
            Environment: _env.EnvironmentName,
            ServerTimeUtc: DateTime.UtcNow,
            SaaS: saasStatus,
            Notifications: notifStatus
        ));
    }
}