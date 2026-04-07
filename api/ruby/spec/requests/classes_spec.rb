require "rails_helper"

RSpec.describe "Classes API", type: :request do
  describe "GET /classes" do
    it "returns all seeded classes ordered by start_time" do
      get "/classes"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to be_an(Array)
      expect(body.size).to eq(3)

      names = body.map { |c| c["name"] }
      expect(names).to eq(["Piano for Beginners", "Chess Club", "Art & Crafts"])
    end

    it "includes registered_count and capacity" do
      get "/classes"
      piano = response.parsed_body.find { |c| c["name"] == "Piano for Beginners" }

      expect(piano).to include(
        "capacity"         => 2,
        "registered_count" => 2,
      )
      expect(piano.keys).to include(
        "id", "name", "description", "capacity",
        "start_time", "end_time", "created_at", "registered_count",
      )
    end

    it "reports registered_count of 0 for classes with no registrations" do
      get "/classes"
      chess = response.parsed_body.find { |c| c["name"] == "Chess Club" }
      expect(chess["registered_count"]).to eq(0)
    end
  end

  describe "GET /classes/:id" do
    it "returns a single class with registered_count" do
      get "/classes/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include(
        "id"               => "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "name"             => "Piano for Beginners",
        "registered_count" => 2,
      )
    end

    it "returns 404 for an unknown id" do
      get "/classes/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Class not found")
    end
  end
end
