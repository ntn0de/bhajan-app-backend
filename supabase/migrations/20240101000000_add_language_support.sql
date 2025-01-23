-- Create languages table
CREATE TABLE languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger function to ensure only one default language
CREATE OR REPLACE FUNCTION ensure_single_default_language()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE languages SET is_default = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for default language management
CREATE TRIGGER manage_default_language
    BEFORE INSERT OR UPDATE ON languages
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_language();

-- Create category_translations table
CREATE TABLE category_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT category_or_subcategory_required CHECK (
    (category_id IS NOT NULL AND subcategory_id IS NULL) OR
    (category_id IS NULL AND subcategory_id IS NOT NULL)
  ),
  CONSTRAINT unique_category_translation UNIQUE (category_id, language_id),
  CONSTRAINT unique_subcategory_translation UNIQUE (subcategory_id, language_id)
);

-- Create article_translations table
CREATE TABLE article_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_article_translation UNIQUE (article_id, language_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX idx_category_translations_subcategory_id ON category_translations(subcategory_id);
CREATE INDEX idx_category_translations_language_id ON category_translations(language_id);
CREATE INDEX idx_article_translations_article_id ON article_translations(article_id);
CREATE INDEX idx_article_translations_language_id ON article_translations(language_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_category_translations_updated_at
    BEFORE UPDATE ON category_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_translations_updated_at
    BEFORE UPDATE ON article_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default English language
INSERT INTO languages (code, name, is_default, is_active)
VALUES ('en', 'English', true, true);