Rails.application.routes.draw do
  get "/health", to: "health#show"

  resources :classes, only: [:index, :show]
  resources :parents, only: [:index]

  get "/registrations/all", to: "registrations#all"
  resources :registrations, only: [:index, :create, :destroy]
end
