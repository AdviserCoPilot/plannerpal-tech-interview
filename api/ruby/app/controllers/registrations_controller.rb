class RegistrationsController < ApplicationController
  def index
    rows = Registration
      .active
      .joins(:klass)
      .where(parent_id: params[:parentId])
      .order("classes.start_time ASC")
      .pluck("registrations.id", "registrations.class_id", "registrations.status", "classes.name")

    render json: { registrations: rows.map { |id, class_id, status, class_name|
      { id: id, class_id: class_id, status: status, class_name: class_name }
    } }
  end

  def all
    rows = Registration
      .active
      .joins(:klass, :parent)
      .order("classes.start_time ASC, parents.name ASC")
      .pluck(
        "registrations.id",
        "registrations.class_id",
        "classes.name",
        "parents.name",
        "parents.email",
        "registrations.created_at",
      )

    render json: rows.map { |id, class_id, class_name, parent_name, parent_email, created_at|
      {
        id: id,
        class_id: class_id,
        class_name: class_name,
        parent_name: parent_name,
        parent_email: parent_email,
        created_at: created_at&.iso8601,
      }
    }
  end

  def create
    result = Registrations::CreateService.call(
      class_id: params[:classId],
      parent_id: params[:parentId],
    )
    render json: { status: result.status, message: result.message }, status: :created
  end

  def destroy
    Registrations::CancelService.call(id: params[:id])
    head :no_content
  end
end
