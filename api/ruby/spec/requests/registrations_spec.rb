require "rails_helper"

RSpec.describe "Registrations API (reads)", type: :request do
  let(:alice_id) { "11111111-1111-1111-1111-111111111111" }
  let(:carol_id) { "33333333-3333-3333-3333-333333333333" }
  let(:piano_id) { "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }

  describe "GET /registrations?parentId=" do
    it "returns the parent's active registrations wrapped in an object" do
      get "/registrations", params: { parentId: alice_id }

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to have_key("registrations")
      expect(body["registrations"]).to be_an(Array)

      reg = body["registrations"].first
      expect(reg).to include(
        "class_id"   => piano_id,
        "status"     => "registered",
        "class_name" => "Piano for Beginners",
      )
      expect(reg.keys).to contain_exactly("id", "class_id", "status", "class_name")
    end

    it "returns an empty array when the parent has no registrations" do
      get "/registrations", params: { parentId: carol_id }
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq("registrations" => [])
    end
  end

  describe "GET /registrations/all" do
    it "returns all active registrations as a flat array" do
      get "/registrations/all"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to be_an(Array)
      expect(body.size).to be >= 2 # Alice + Bob seeded into Piano

      sample = body.first
      expect(sample.keys).to contain_exactly(
        "id", "class_id", "class_name", "parent_name", "parent_email", "created_at",
      )
    end
  end
end
