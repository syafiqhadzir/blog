# frozen_string_literal: true

source 'https://rubygems.org'

ruby '>= 3.4.0'

gem 'base64'
gem 'bigdecimal'
gem 'csv'
gem 'faraday-retry' # Clean retry middleware for Faraday v2.0+
gem 'fiddle' # Future-proofing: will not be default gem in Ruby 3.5+
gem 'jekyll'
gem 'jekyll-feed'
gem 'jekyll-github-metadata'
gem 'jekyll-minifier', '~> 0.2.2'
gem 'jekyll-seo-tag'
gem 'jekyll-sitemap'
gem 'kramdown-parser-gfm'
gem 'logger'
gem 'ostruct'
gem 'rexml'
gem 'webrick'

# Testing gems for pyramid testing
group :test do
  gem 'html-proofer', '~> 5.0'
  gem 'rspec', '~> 3.13'
  gem 'rspec_junit_formatter', '~> 0.6', require: false
  gem 'rubocop', '~> 1.69', require: false
  gem 'rubocop-rspec', '~> 3.2', require: false
end

platforms :windows do
  gem 'wdm', '>= 0.1.0'
end

gem 'rubocop-performance', '~> 1.26', group: :development
gem 'rubocop-rake', '~> 0.7.1', group: :development
