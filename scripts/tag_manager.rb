require 'yaml'
require 'date'

POSTS_DIR = '_posts'

# Canonical Tag Dictionary
CANONICAL_TAGS = %w[
  qa testing automation security performance accessibility ai web3 pwa
  devops mobile frontend backend career soft-skills sustainability
  blockchain crypto machine-learning cloud architecture
  strategies management tools privacy ethics
].freeze

# Synonym Mapping
SYNONYMS = {
  'quality' => 'qa',
  'speed' => 'performance',
  'load' => 'performance',
  'hacking' => 'security',
  'a11y' => 'accessibility',
  'gpt' => 'ai',
  'llm' => 'ai',
  'iot' => 'hardware',
  '5g' => 'networking',
  '6g' => 'networking',
  'data' => 'data',
  'etl' => 'data',
  'sql' => 'data'
}.freeze

def normalize_tags(list)
  list.map { |t| t.to_s.downcase.strip }
      .map { |t| SYNONYMS[t] || t }
      .uniq
      .select { |t| CANONICAL_TAGS.include?(t) || t == 'qa' } # Ensure 'qa' is allowed even if not in list (it is in list)
end

puts 'Starting Bulk Tagging...'

Dir.glob("#{POSTS_DIR}/*.md").each do |file|
  content = File.read(file)

  # Regex to capture Front Matter
  next unless content =~ /\A(---\s*[\r\n]+)(.*?)([\r\n]+---\s*[\r\n]+)(.*)/m

  head = Regexp.last_match(1)
  fm_text = Regexp.last_match(2)
  tail = Regexp.last_match(3)
  body = Regexp.last_match(4)

  begin
    fm = YAML.safe_load(fm_text, permitted_classes: [Date, Time])

    # 1. Start with existing tags
    tags = fm['tags'] || []
    tags = [tags] if tags.is_a?(String)

    # 2. Add from Category
    if fm['category']
      cat = fm['category'].to_s.downcase
      tags << cat
      tags << 'qa' if cat == 'qa'
    end

    # 3. Add from Slug/Keywords
    slug = fm['slug'] || File.basename(file, '.md')[11..]
    slug_words = slug.to_s.split('-')
    slug_words.each do |w|
      tags << w if CANONICAL_TAGS.include?(w) || SYNONYMS.key?(w)
    end

    # 4. Normalize & Dedupe
    final_tags = normalize_tags(tags)

    # Fallback
    final_tags << 'qa' if final_tags.empty?

    # Apply to FM
    fm['tags'] = final_tags.sort

    # Reconstruct YAML
    # Use psych to dump, strip --- lines
    yaml_out = YAML.dump(fm).strip
    # Remove leading ---
    yaml_out = yaml_out.sub(/\A---\s*[\r\n]+/, '')

    # Rebuild content
    new_content = "---\n#{yaml_out}\n---#{body}"

    File.write(file, new_content)
    # puts "Tagged #{File.basename(file)}: #{final_tags.join(', ')}"
  rescue StandardError => e
    puts "FAILED: #{file} - #{e.message}"
  end
end

puts 'Bulk Tagging Complete.'
