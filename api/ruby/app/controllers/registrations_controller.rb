class RegistrationsController < ApplicationController
  def index
    parent_id = params[:parentId]
    rows = Registration
      .active
      .joins(:klass)
      .where(parent_id: parent_id)
      .order("classes.start_time ASC")
      .pluck("registrations.id", "registrations.class_id", "registrations.status", "classes.name")

    payload = rows.map do |id, class_id, status, class_name|
      {
        id:         id,
        class_id:   class_id,
        status:     status,
        class_name: class_name,
      }
    end

    render json: { registrations: payload }
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

    payload = rows.map do |id, class_id, class_name, parent_name, parent_email, created_at|
      {
        id:           id,
        class_id:     class_id,
        class_name:   class_name,
        parent_name:  parent_name,
        parent_email: parent_email,
        created_at:   created_at&.iso8601,
      }
    end

    render json: payload
  end
end
