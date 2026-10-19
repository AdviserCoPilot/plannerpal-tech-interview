class NotFoundError < ApiError
  def status
    :not_found
  end
end
