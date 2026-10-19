class Parent < ApplicationRecord
  self.table_name = "parents"

  has_many :registrations, dependent: :destroy
end
