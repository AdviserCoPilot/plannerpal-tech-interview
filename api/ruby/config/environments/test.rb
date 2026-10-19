Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = false
  config.cache_classes = true
  config.public_file_server.enabled = true
  config.consider_all_requests_local = true
  config.action_dispatch.show_exceptions = :rescuable
  config.active_support.deprecation = :stderr
  config.hosts.clear
end
