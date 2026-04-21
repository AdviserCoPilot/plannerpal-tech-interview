class ConflictError < ApiError
  def status
    :conflict
  end
end
