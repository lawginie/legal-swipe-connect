-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user types
CREATE TYPE user_type AS ENUM ('client', 'lawyer');

-- Create enum for service categories
CREATE TYPE service_category AS ENUM (
  'bail_application',
  'debt_review',
  'maintenance',
  'eviction',
  'debt_collection',
  'letter_of_demand',
  'contract_review',
  'divorce',
  'other'
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wallet_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lawyer services table
CREATE TABLE lawyer_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category service_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  is_package BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create swipes table to track user interactions
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_right BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, lawyer_id)
);

-- Create matches table for mutual interest
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, lawyer_id)
);

-- Create chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Lawyer services policies
CREATE POLICY "Anyone can view lawyer services"
  ON lawyer_services FOR SELECT
  USING (true);

CREATE POLICY "Lawyers can create own services"
  ON lawyer_services FOR INSERT
  WITH CHECK (
    auth.uid() = lawyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'lawyer')
  );

CREATE POLICY "Lawyers can update own services"
  ON lawyer_services FOR UPDATE
  USING (
    auth.uid() = lawyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'lawyer')
  );

CREATE POLICY "Lawyers can delete own services"
  ON lawyer_services FOR DELETE
  USING (auth.uid() = lawyer_id);

-- Swipes policies
CREATE POLICY "Users can view own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Matches policies
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);

-- Chat rooms policies
CREATE POLICY "Users can view own chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = chat_rooms.match_id 
      AND (matches.client_id = auth.uid() OR matches.lawyer_id = auth.uid())
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      JOIN matches ON matches.id = chat_rooms.match_id
      WHERE chat_rooms.id = messages.room_id
      AND (matches.client_id = auth.uid() OR matches.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their rooms"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      JOIN matches ON matches.id = chat_rooms.match_id
      WHERE chat_rooms.id = room_id
      AND (matches.client_id = auth.uid() OR matches.lawyer_id = auth.uid())
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to auto-create match when both swipe right
CREATE OR REPLACE FUNCTION create_match_on_mutual_swipe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.swiped_right = true THEN
    -- Check if lawyer also swiped right on client
    IF EXISTS (
      SELECT 1 FROM swipes 
      WHERE client_id = NEW.lawyer_id 
      AND lawyer_id = NEW.client_id 
      AND swiped_right = true
    ) THEN
      -- Create match if it doesn't exist
      INSERT INTO matches (client_id, lawyer_id)
      VALUES (NEW.client_id, NEW.lawyer_id)
      ON CONFLICT (client_id, lawyer_id) DO NOTHING;
      
      -- Create chat room for the match
      INSERT INTO chat_rooms (match_id)
      SELECT id FROM matches 
      WHERE client_id = NEW.client_id AND lawyer_id = NEW.lawyer_id
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating matches
CREATE TRIGGER on_swipe_create_match
  AFTER INSERT ON swipes
  FOR EACH ROW EXECUTE FUNCTION create_match_on_mutual_swipe();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;