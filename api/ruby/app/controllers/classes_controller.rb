class ClassesController < ApplicationController
  def index
    klasses = Klass.order(:start_time)
    counts = registered_counts_for(klasses.pluck(:id))
    render json: klasses.map { |k| serialize(k, counts.fetch(k.id, 0)) }
  end

  def show
    klass = Klass.find_by(id: params[:id]) or raise NotFoundError, "Class not found"
    count = registered_counts_for([klass.id]).fetch(klass.id, 0)
    render json: serialize(klass, count)
  end

  private

  def registered_counts_for(class_ids)
    return {} if class_ids.empty?

    Registration.active.where(class_id: class_ids).group(:class_id).count
  end

  def serialize(klass, registered_count)
    {
      id: klass.id,
      name: klass.name,
      description: klass.description,
      capacity: klass.capacity,
      start_time: klass.start_time&.iso8601,
      end_time: klass.end_time&.iso8601,
      created_at: klass.created_at&.iso8601,
      registered_count: registered_count,
    }
  end
end
