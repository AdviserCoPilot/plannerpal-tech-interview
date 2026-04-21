module Registrations
  class CancelService
    def self.call(id:)
      reg = Registration.active.find_by(id: id)
      raise NotFoundError, "Registration not found" if reg.nil?

      reg.update!(status: Registration::STATUS_CANCELLED)
    end
  end
end
