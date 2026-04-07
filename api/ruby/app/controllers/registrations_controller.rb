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

  def create
    class_id  = params[:classId]
    parent_id = params[:parentId]

    error = nil
    Registration.transaction do
      klass = Klass.lock.find_by(id: class_id)
      if klass.nil?
        error = ["Class not found", :not_found]
        raise ActiveRecord::Rollback
      end

      parent = Parent.find_by(id: parent_id)
      if parent.nil?
        error = ["Parent not found", :not_found]
        raise ActiveRecord::Rollback
      end

      registered_count = Registration.active.where(class_id: class_id).count
      if registered_count >= klass.capacity
        error = ["Class is full", :conflict]
        raise ActiveRecord::Rollback
      end

      existing = Registration.find_by(class_id: class_id, parent_id: parent_id)
      if existing
        existing.update!(status: Registration::STATUS_REGISTERED)
      else
        Registration.create!(
          class_id:  class_id,
          parent_id: parent_id,
          status:    Registration::STATUS_REGISTERED,
        )
      end
    end

    return render_error(*error) if error

    render json: {
      status:  "registered",
      message: "Successfully registered for class",
    }, status: :created
  end

  def destroy
    reg = Registration.active.find_by(id: params[:id])
    return render_error("Registration not found", :not_found) unless reg

    reg.update!(status: Registration::STATUS_CANCELLED)
    head :no_content
  end
end
