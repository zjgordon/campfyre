-- Demo seed data for Campfyre
-- This file contains sample data for development and testing

-- Sample Campaign
INSERT INTO campaigns (id, name, description, created_at, updated_at) VALUES 
('hello-world-campaign', 'Hello World Campaign', 'A sample campaign to demonstrate Campfyre functionality', NOW(), NOW());

-- Sample Session
INSERT INTO sessions (id, campaign_id, name, description, created_at, updated_at) VALUES 
('first-session', 'hello-world-campaign', 'First Session', 'The inaugural session of our Hello World Campaign', NOW(), NOW());

-- Sample Template (D&D 5e stub)
INSERT INTO templates (id, name, system, version, content, created_at, updated_at) VALUES 
('dnd5e-stub', 'D&D 5e Basic', 'dnd5e', '1.0.0', '{"name": "D&D 5e Basic", "system": "dnd5e", "version": "1.0.0", "classes": ["Fighter", "Wizard", "Rogue", "Cleric"], "races": ["Human", "Elf", "Dwarf", "Halfling"]}', NOW(), NOW());

-- Sample Character
INSERT INTO characters (id, campaign_id, name, class, race, level, created_at, updated_at) VALUES 
('sample-character', 'hello-world-campaign', 'Sample Hero', 'Fighter', 'Human', 1, NOW(), NOW());
