class ApiError < StandardError
  def status
    :internal_server_error
  end
end
