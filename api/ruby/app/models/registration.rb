class Registration < ApplicationRecord
  self.table_name = "registrations"

  STATUS_REGISTERED = "registered".freeze
  STATUS_CANCELLED  = "cancelled".freeze

  belongs_to :parent
  belongs_to :klass, foreign_key: :class_id

  scope :active, -> { where(status: STATUS_REGISTERED) }
end
