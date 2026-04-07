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

  describe "POST /registrations" do
    let(:chess_id) { "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" }
    let(:art_id)   { "cccccccc-cccc-cccc-cccc-cccccccccccc" }
    let(:dan_id)   { "44444444-4444-4444-4444-444444444444" }
    let(:eva_id)   { "55555555-5555-5555-5555-555555555555" }

    it "creates a registration for an available class and returns 201" do
      post "/registrations", params: { classId: chess_id, parentId: dan_id }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to eq(
        "status"  => "registered",
        "message" => "Successfully registered for class",
      )

      created = Registration.find_by(class_id: chess_id, parent_id: dan_id)
      expect(created).not_to be_nil
      expect(created.status).to eq("registered")
    end

    it "returns 409 when the class is full" do
      post "/registrations",
           params: { classId: piano_id, parentId: dan_id },
           as: :json

      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body).to eq("error" => "Class is full")
    end

    it "returns 404 when the class does not exist" do
      post "/registrations",
           params: { classId: "00000000-0000-0000-0000-000000000000", parentId: dan_id },
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Class not found")
    end

    it "returns 404 when the parent does not exist" do
      post "/registrations",
           params: { classId: chess_id, parentId: "00000000-0000-0000-0000-000000000000" },
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Parent not found")
    end

    it "reactivates a previously cancelled registration (upsert)" do
      Registration.create!(class_id: art_id, parent_id: eva_id, status: "cancelled")

      post "/registrations", params: { classId: art_id, parentId: eva_id }, as: :json

      expect(response).to have_http_status(:created)
      rows = Registration.where(class_id: art_id, parent_id: eva_id)
      expect(rows.size).to eq(1)
      expect(rows.first.status).to eq("registered")
    end
  end

  describe "DELETE /registrations/:id" do
    let(:bob_id) { "22222222-2222-2222-2222-222222222222" }

    it "soft-deletes the registration and returns 204" do
      reg = Registration.find_by!(class_id: piano_id, parent_id: bob_id)

      delete "/registrations/#{reg.id}"

      expect(response).to have_http_status(:no_content)
      expect(reg.reload.status).to eq("cancelled")
    end

    it "returns 404 for an already-cancelled registration" do
      reg = Registration.find_by!(class_id: piano_id, parent_id: bob_id)
      reg.update!(status: "cancelled")

      delete "/registrations/#{reg.id}"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Registration not found")
    end

    it "returns 404 for an unknown id" do
      delete "/registrations/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Registration not found")
    end
  end
end
