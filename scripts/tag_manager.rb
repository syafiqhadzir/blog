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
      .select { |t| CANONICAL_TAGS.include?(t) || t == 'qa' }
end

puts 'Starting Bulk Tagging...'
count = 0

Dir.glob("#{POSTS_DIR}/*.md").each do |file|
  # STRIP BOM for Windows compatibility
  content = File.read(file).sub("\uFEFF", '')

  if content =~ /\A(---\s*[\r\n]+)(.*?)([\r\n]+---\s*[\r\n]+)(.*)/m
    head = Regexp.last_match(1)
    fm_text = Regexp.last_match(2)
    tail = Regexp.last_match(3)
    body = Regexp.last_match(4)

    begin
      fm = YAML.safe_load(fm_text, permitted_classes: [Date, Time])

      tags = fm['tags'] || []
      tags = [tags] if tags.is_a?(String)

      if fm['category']
        cat = fm['category'].to_s.downcase
        tags << cat
        tags << 'qa' if cat == 'qa'
      end

      slug = fm['slug'] || File.basename(file, '.md')[11..]
      slug_words = slug.to_s.split('-')
      slug_words.each do |w|
        tags << w if CANONICAL_TAGS.include?(w) || SYNONYMS.key?(w)
      end

      final_tags = normalize_tags(tags)
      final_tags << 'qa' if final_tags.empty?

      fm['tags'] = final_tags.sort

      yaml_out = YAML.dump(fm).strip
      yaml_out = yaml_out.sub(/\A---\s*[\r\n]+/, '')

      new_content = "---\n#{yaml_out}\n---#{body}"

      File.write(file, new_content)
      count += 1
      # puts "Tagged #{File.basename(file)}: #{final_tags.join(', ')}"
    rescue StandardError => e
      puts "FAILED: #{file} - #{e.message}"
    end
  else
    puts "NO MATCH: #{file}"
  end
end

puts "Bulk Tagging Complete. Updated #{count} files."
