require "rails_helper"

RSpec.describe "GET /parents", type: :request do
  it "returns all seeded parents ordered by name" do
    get "/parents"

    expect(response).to have_http_status(:ok)
    body = response.parsed_body
    expect(body).to be_an(Array)
    expect(body.size).to eq(7)
    expect(body.map { |p| p["name"] }).to eq(body.map { |p| p["name"] }.sort)
    expect(body.first.keys).to contain_exactly("id", "email", "name")
  end

  it "includes Alice Smith's seeded record" do
    get "/parents"
    alice = response.parsed_body.find { |p| p["email"] == "alice@example.com" }
    expect(alice).to include(
      "id"    => "11111111-1111-1111-1111-111111111111",
      "email" => "alice@example.com",
      "name"  => "Alice Smith",
    )
  end
end
