# frozen_string_literal: true

require 'rake'

# Default task
task default: ['lint:all', 'test:unit']

namespace :build do
  desc 'Build Jekyll site'
  task :site do
    puts '🔨 Building Jekyll site...'
    sh 'bundle exec jekyll build'
    puts '✅ Build complete!'
  end

  desc 'Clean Jekyll build artifacts'
  task :clean do
    puts '🧹 Cleaning build artifacts...'
    sh 'bundle exec jekyll clean'
    puts '✅ Clean complete!'
  end
end

namespace :test do
  desc 'Run all tests'
  task all: ['lint:all', 'build:site', :unit, :integration]

  desc 'Run unit tests (RSpec)'
  task :unit do
    puts '🧪 Running RSpec unit tests...'
    sh 'bundle exec rspec spec/unit --format documentation'
    puts '✅ Unit tests passed!'
  end

  desc 'Run integration tests (HTMLProofer)'
  task integration: ['build:site'] do
    puts '🔍 Running HTMLProofer integration tests...'
    options = {
      assume_extension: '.html',
      check_html: true,
      check_img_http: true,
      check_opengraph: true,
      enforce_https: true,
      checks: %w[Links Images Scripts],
      ignore_urls: [/^#/, /^mailto:/, /^javascript:/]
    }
    sh "bundle exec ruby -e \"require 'html-proofer'; HTMLProofer.check_directory('./_site', #{options}).run\""
    puts '✅ Integration tests passed!'
  end

  desc 'Validate AMP pages'
  task :amp do
    puts '⚡ Validating AMP pages...'
    require 'nokogiri'

    errors = []
    Dir.glob('_site/**/*.html').each do |file|
      doc = Nokogiri::HTML(File.read(file))
      html = doc.at_css('html')

      errors << "#{file}: Missing AMP attribute" unless html && (html['⚡'] || html['amp'])
    end

    if errors.empty?
      puts '✅ All pages are valid AMP!'
    else
      errors.each { |e| puts "⚠️  #{e}" }
      raise 'AMP validation failed'
    end
  end
end

desc 'Run full test suite'
task test: ['test:unit']

desc 'Serve Jekyll site locally'
task :serve do
  sh 'bundle exec jekyll serve --livereload'
end

namespace :lint do
  desc 'Run all linters'
  task all: %i[ruby yaml json]

  desc 'Run RuboCop'
  task :ruby do
    puts '🔍 Running RuboCop...'
    sh 'bundle exec rubocop'
    puts '✅ RuboCop passed!'
  end

  desc 'Validate YAML files'
  task :yaml do
    puts '🔍 Validating YAML files...'
    require 'yaml'
    ['_config.yml', '_data/menu.yml'].each do |file|
      YAML.safe_load_file(file)
      puts "  ✅ #{file}"
    end
    puts '✅ YAML validation passed!'
  end

  desc 'Validate JSON files'
  task :json do
    puts '🔍 Validating JSON files...'
    require 'json'
    ['site.webmanifest'].each do |file|
      JSON.parse(File.read(file))
      puts "  ✅ #{file}"
    end
    puts '✅ JSON validation passed!'
  end
end
