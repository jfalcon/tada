INSERT IGNORE INTO categories (category) VALUES
    ('Family and Relationships'),
    ('Financial Tasks'),
    ('Health and Wellness'),
    ('Hobbies and Recreation'),
    ('Household Chores'),
    ('Learning and Development'),
    ('Personal Errands'),
    ('Work Tasks');

-- in the world world SHA-256 would not be used for hashing and passwords
-- would be salted and not specified this way, it's just for demo purposes
INSERT IGNORE INTO users (username, email, password_hash) VALUES
    ('john_doe', 'john.doe@example.com', SHA2('password1', 256)),
    ('jane_smith', 'jane.smith@example.com', SHA2('password2', 256)),
    ('alice_wonder', 'alice.wonder@example.com', SHA2('password3', 256));
