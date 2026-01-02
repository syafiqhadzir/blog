# frozen_string_literal: true

# Manages the canonicalization and normalization of tags across all blog posts.
# Ensures consistency by enforcing a whitelist (CANONICAL_TAGS) and mapping
# synonyms (SYNONYMS) to their primary counterparts.
class TagManager
  POSTS_DIR = '_posts'

  CANONICAL_TAGS = %w[
    qa testing automation security performance accessibility ai web3 pwa
    devops mobile frontend backend career soft-skills sustainability
    blockchain crypto machine-learning cloud architecture
    strategies management tools privacy ethics
  ].freeze

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

  # Iterates through all markdown files in the posts directory and processes them.
  def self.run
    puts 'Starting Bulk Tagging...'
    count = 0
    Dir.glob("#{POSTS_DIR}/*.md").each do |file|
      count += 1 if process_file(file)
    end
    puts "Bulk Tagging Complete. Updated #{count} files."
  end

  def self.process_file(file)
    content = File.read(file).sub("\uFEFF", '') # STRIP BOM
    return false unless content =~ /\A(---\s*[\r\n]+)(.*?)([\r\n]+---\s*[\r\n]+)(.*)/m

    process_content(file, Regexp.last_match(2), Regexp.last_match(4))
    true
  rescue StandardError => e
    puts "FAILED: #{file} - #{e.message}"
    false
  end

  def self.process_content(file, fm_text, body)
    fm = YAML.safe_load(fm_text, permitted_classes: [Date, Time])
    tags = extract_initial_tags(fm)
    add_category_tags(fm, tags)
    add_slug_tags(file, fm, tags)

    final_tags = normalize_tags(tags)
    final_tags << 'qa' if final_tags.empty?
    fm['tags'] = final_tags.sort

    write_file(file, fm, body)
  end

  def self.extract_initial_tags(front_matter)
    tags = front_matter['tags'] || []
    tags.is_a?(String) ? [tags] : tags
  end

  def self.add_category_tags(front_matter, tags)
    return unless front_matter['category']

    cat = front_matter['category'].to_s.downcase
    tags << cat
    tags << 'qa' if cat == 'qa'
  end

  def self.add_slug_tags(file, front_matter, tags)
    slug = front_matter['slug'] || File.basename(file, '.md')[11..]
    slug.to_s.split('-').each do |w|
      tags << w if CANONICAL_TAGS.include?(w) || SYNONYMS.key?(w)
    end
  end

  # Normalizes a list of tags: downcases, strips, maps synonyms, and filters against the whitelist.
  def self.normalize_tags(list)
    list.map { |t| t.to_s.downcase.strip }
        .map { |t| SYNONYMS[t] || t }
        .uniq
        .select { |t| CANONICAL_TAGS.include?(t) || t == 'qa' }
  end

  def self.write_file(file, front_matter, body)
    yaml_out = YAML.dump(front_matter).strip.sub(/\A---\s*[\r\n]+/, '')
    new_content = "---\n#{yaml_out}\n---#{body}"
    File.write(file, new_content)
  end
end

TagManager.run if __FILE__ == $PROGRAM_NAME
