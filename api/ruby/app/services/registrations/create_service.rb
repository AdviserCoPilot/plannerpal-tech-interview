module Registrations
  class CreateService
    Result = Struct.new(:status, :message)

    def self.call(class_id:, parent_id:)
      new(class_id: class_id, parent_id: parent_id).call
    end

    def initialize(class_id:, parent_id:)
      @class_id = class_id
      @parent_id = parent_id
    end

    def call
      Registration.transaction do
        klass = Klass.lock.find_by(id: @class_id)
        raise NotFoundError, "Class not found" if klass.nil?

        parent = Parent.find_by(id: @parent_id)
        raise NotFoundError, "Parent not found" if parent.nil?

        raise ConflictError, "Class is full" if Registration.active.where(class_id: @class_id).count >= klass.capacity

        upsert!
      end

      Result.new("registered", "Successfully registered for class")
    end

    private

    def upsert!
      existing = Registration.find_by(class_id: @class_id, parent_id: @parent_id)
      if existing
        existing.update!(status: Registration::STATUS_REGISTERED)
      else
        Registration.create!(class_id: @class_id, parent_id: @parent_id, status: Registration::STATUS_REGISTERED)
      end
    end
  end
end
