class ParentsController < ApplicationController
  def index
    parents = Parent.order(:name)
    render json: parents.map { |p| serialize(p) }
  end

  private

  def serialize(parent)
    {
      id:    parent.id,
      email: parent.email,
      name:  parent.name,
    }
  end
end
