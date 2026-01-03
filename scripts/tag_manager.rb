# frozen_string_literal: true

require 'yaml'

# module containing whitelist to keep TagManager clean
module CanonicalTags
  # All canonical tags must be >= 4 characters.
  CANONICAL_TAGS = %w[
    automation security performance accessibility
    artificial-intelligence progressive-web-apps web3 devops mobile frontend
    backend career soft-skills sustainability blockchain crypto machine-learning
    cloud architecture strategies management tools privacy ethics

    unit-testing integration-testing e2e-testing visual-testing contract-testing
    chaos-testing load-testing mutation-testing stress-testing regression-testing
    exploratory-testing smoke-testing

    penetration-testing vulnerability-scanning access-control encryption
    zero-trust compliance authentication authorisation

    monitoring tracing logging observability debugging reliability

    containers kubernetes serverless microservices infrastructure edge-computing
    service-mesh networking

    real-time websockets streaming data-quality data-engineering

    user-experience responsive-design internationalisation localisation

    finops cost-optimisation

    quantum metaverse spatial-computing emerging-tech biotech
  ].freeze
end

# module containing synonyms
module TagSynonyms
  # Maps short or alternative terms to canonical tags.
  SYNONYMS = {
    'ai' => 'artificial-intelligence',
    'pwa' => 'progressive-web-apps',
    'speed' => 'performance',
    'hacking' => 'security',
    'a11y' => 'accessibility',
    'gpt' => 'artificial-intelligence',
    'llm' => 'artificial-intelligence',
    'ml' => 'machine-learning',
    'iot' => 'edge-computing',
    '5g' => 'networking',
    '6g' => 'networking',
    'data' => 'data-engineering',
    'etl' => 'data-engineering',
    'sql' => 'data-engineering',
    'k8s' => 'kubernetes',
    'docker' => 'containers',
    'sre' => 'reliability',
    'cicd' => 'devops',
    'ci' => 'devops',
    'cd' => 'devops',
    'i18n' => 'internationalisation',
    'l10n' => 'localisation',
    'rtl' => 'localisation',
    'ux' => 'user-experience',
    'ui' => 'frontend',
    'vr' => 'spatial-computing',
    'ar' => 'spatial-computing',
    'xr' => 'spatial-computing'
  }.freeze
end

# module containing keyword mappings (Testing & Security)
module TagKeywordsPrimary
  MAPPING = {
    'unit' => 'unit-testing', 'integration' => 'integration-testing',
    'e2e' => 'e2e-testing', 'end-to-end' => 'e2e-testing',
    'visual' => 'visual-testing', 'contract' => 'contract-testing',
    'pact' => 'contract-testing', 'chaos' => 'chaos-testing',
    'load' => 'load-testing', 'stress' => 'stress-testing',
    'mutation' => 'mutation-testing', 'regression' => 'regression-testing',
    'exploratory' => 'exploratory-testing', 'smoke' => 'smoke-testing',
    'snapshot' => 'visual-testing',
    'penetration' => 'penetration-testing',
    'vulnerability' => 'vulnerability-scanning',
    'oauth' => 'authentication', 'oauth2' => 'authentication',
    'sso' => 'authentication', 'jwt' => 'authentication',
    'zero-trust' => 'zero-trust', 'csp' => 'security',
    'gdpr' => 'compliance', 'pci' => 'compliance',
    'encryption' => 'encryption', 'cryptography' => 'encryption',
    'homomorphic' => 'encryption'
  }.freeze
end

# module containing keyword mappings (Infrastructure, Data, etc)
module TagKeywordsSecondary
  MAPPING = {
    'monitoring' => 'monitoring', 'tracing' => 'tracing',
    'logging' => 'logging', 'observability' => 'observability',
    'debug' => 'debugging', 'debugging' => 'debugging',
    'post-mortem' => 'debugging',
    'kubernetes' => 'kubernetes', 'k8s' => 'kubernetes',
    'container' => 'containers', 'docker' => 'containers',
    'serverless' => 'serverless', 'microservice' => 'microservices',
    'micro-frontend' => 'microservices', 'service-mesh' => 'service-mesh',
    'edge' => 'edge-computing', 'cdn' => 'infrastructure',
    'cicd' => 'devops', 'pipeline' => 'devops',
    'blue-green' => 'devops', 'canary' => 'devops',
    'websocket' => 'real-time', 'grpc' => 'real-time',
    'sse' => 'real-time', 'streaming' => 'streaming',
    'realtime' => 'real-time', 'etl' => 'data-engineering',
    'warehouse' => 'data-engineering', 'cdc' => 'data-engineering'
  }.freeze
end

# module containing keyword mappings (Performance, Frontend, Emerging)
module TagKeywordsTertiary
  MAPPING = {
    'performance' => 'performance', 'web-vitals' => 'performance',
    'latency' => 'performance', 'bandwidth' => 'performance',
    'battery' => 'performance', 'memory' => 'performance',
    'optimisation' => 'performance', 'optimization' => 'performance',
    'accessibility' => 'accessibility', 'a11y' => 'accessibility',
    'i18n' => 'internationalisation', 'l10n' => 'localisation',
    'rtl' => 'localisation', 'responsive' => 'responsive-design',
    'mobile' => 'mobile', 'pwa' => 'progressive-web-apps',
    'offline' => 'progressive-web-apps',
    'service-worker' => 'progressive-web-apps',
    'web3' => 'web3', 'blockchain' => 'blockchain',
    'smart-contract' => 'blockchain', 'quantum' => 'quantum',
    'metaverse' => 'metaverse', 'spatial' => 'spatial-computing',
    'webxr' => 'spatial-computing', 'webgpu' => 'emerging-tech',
    'webnn' => 'emerging-tech', 'wasm' => 'emerging-tech',
    'webassembly' => 'emerging-tech', 'biotech' => 'biotech',
    'bio-integrated' => 'biotech',
    'ai' => 'artificial-intelligence', 'ml' => 'machine-learning',
    'llm' => 'artificial-intelligence', 'gpt' => 'artificial-intelligence',
    'generative' => 'artificial-intelligence', 'hallucination' => 'artificial-intelligence',
    'prompt' => 'artificial-intelligence', 'agent' => 'artificial-intelligence',
    'vector' => 'artificial-intelligence',
    'resilience' => 'reliability', 'disaster' => 'reliability',
    'failover' => 'reliability', 'circuit-breaker' => 'reliability',
    'rate-limiting' => 'reliability'
  }.freeze
end

# Manages the canonicalization and normalization of tags across all blog posts.
class TagManager
  include CanonicalTags
  include TagSynonyms
  include TagKeywordsPrimary
  include TagKeywordsSecondary
  include TagKeywordsTertiary

  POSTS_DIR = '_posts'
  MIN_TAG_LENGTH = 4
  KEYWORD_TAGS = TagKeywordsPrimary::MAPPING
                 .merge(TagKeywordsSecondary::MAPPING)
                 .merge(TagKeywordsTertiary::MAPPING).freeze

  def self.run
    puts 'Starting Bulk Tagging (Enhanced)...'
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
    add_keyword_tags(file, fm, tags)

    final_tags = normalize_tags(tags)
    final_tags << 'strategies' if final_tags.empty?
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
    tags << 'strategies' if cat == 'qa'
  end

  def self.add_slug_tags(file, front_matter, tags)
    slug = front_matter['slug'] || extract_slug_from_filename(file)
    return unless slug

    slug.to_s.split('-').each do |w|
      tags << w if CANONICAL_TAGS.include?(w) || SYNONYMS.key?(w)
    end
  end

  def self.extract_slug_from_filename(file)
    basename = File.basename(file, '.md')
    basename.length > 11 ? basename[11..] : basename
  end

  def self.add_keyword_tags(file, front_matter, tags)
    title = front_matter['title'].to_s.downcase
    slug = front_matter['slug'] || extract_slug_from_filename(file)
    combined = "#{title} #{slug}"

    KEYWORD_TAGS.each do |keyword, tag|
      tags << tag if combined.include?(keyword)
    end
  end

  def self.normalize_tags(list)
    list.map { |t| t.to_s.downcase.strip }
        .map { |t| SYNONYMS[t] || t }
        .uniq
        .select { |t| t.length >= MIN_TAG_LENGTH && CANONICAL_TAGS.include?(t) }
  end

  def self.write_file(file, front_matter, body)
    yaml_out = YAML.dump(front_matter).strip.sub(/\A---\s*[\r\n]+/, '')
    clean_body = body.sub(/\A[\r\n]*/, "\n")
    new_content = "---\n#{yaml_out}\n---#{clean_body}"
    File.write(file, new_content)
  end
end

TagManager.run if __FILE__ == $PROGRAM_NAME
