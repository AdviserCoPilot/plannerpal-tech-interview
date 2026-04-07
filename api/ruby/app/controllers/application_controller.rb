class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def render_error(message, status)
    render json: { error: message }, status: status
  end

  def render_not_found(exception = nil)
    render_error(exception&.message || "Not found", :not_found)
  end
end
