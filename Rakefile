# frozen_string_literal: true

require 'rake'

# Default task
task default: ['test:unit']

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
  task all: ['build:site', :unit, :integration]

  desc 'Run unit tests (RSpec)'
  task :unit do
    puts '🧪 Running RSpec unit tests...'
    sh 'bundle exec rspec spec/unit --format documentation'
    puts '✅ Unit tests passed!'
  end

  desc 'Run integration tests (HTMLProofer)'
  task integration: ['build:site'] do
    puts '🔍 Running HTMLProofer integration tests...'
    sh 'bundle exec ruby -e "require \"html-proofer\"; HTMLProofer.check_directory(\"./_site\", { assume_extension: \".html\", disable_external: true, enforce_https: false, checks: [\"Links\", \"Images\", \"Scripts\"], allow_missing_href: true, ignore_urls: [/^#/, /^mailto:/, /^javascript:/] }).run"'
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

      unless html && (html['⚡'] || html['amp'])
        errors << "#{file}: Missing AMP attribute"
      end
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
