class ApplicationController < ActionController::API
  rescue_from ApiError, with: :render_api_error
  rescue_from ActiveRecord::RecordNotFound, with: :render_record_not_found

  private

  def render_api_error(exception)
    render json: { error: exception.message }, status: exception.status
  end

  def render_record_not_found(exception)
    render json: { error: exception.message || "Not found" }, status: :not_found
  end
end
