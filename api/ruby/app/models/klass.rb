# Maps to the `classes` table. Named `Klass` because `Class` is a Ruby builtin.
class Klass < ApplicationRecord
  self.table_name = "classes"

  has_many :registrations, foreign_key: :class_id, dependent: :destroy
end
