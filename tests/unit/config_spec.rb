# frozen_string_literal: true

require 'json'
require_relative 'spec_helper'

ESSENTIAL_FILES = [
  'robots.txt',
  'assets/favicons/site.webmanifest',
  '404.md',
  'offline.html',
  'CNAME'
].freeze

RSpec.describe 'Site Integrity' do # rubocop:disable RSpec/DescribeClass
  let(:config_file) { File.join(Dir.pwd, '_config.yml') }
  let(:config) { load_yaml(config_file) }

  describe '_config.yml' do
    it 'exists' do
      expect(File.exist?(config_file)).to be(true),
                                          '_config.yml not found in project root'
    end

    it 'has valid YAML syntax' do
      expect { load_yaml(config_file) }.not_to raise_error
    end

    # Required configuration keys
    %w[title author url].each do |key|
      it "has required key: #{key}" do
        expect(config).to have_key(key),
                          "_config.yml: Missing required key '#{key}'"
      end
    end

    describe 'author configuration' do
      it 'has author name' do
        expect(config['author']).to have_key('name'),
                                    'author.name is required'
      end

      it 'has author url' do
        expect(config['author']).to have_key('url'),
                                    'author.url is required'
      end
    end

    describe 'site URL' do
      it 'is a valid URL format' do
        expect(config['url']).to match(%r{^https?://}),
                                 'url must start with http:// or https://'
      end
    end

    describe 'plugins' do
      it 'has plugins array' do
        expect(config).to have_key('plugins'),
                          '_config.yml should define plugins'
      end

      it 'includes essential plugins' do
        plugins = config['plugins'] || []
        essential = %w[jekyll-feed jekyll-seo-tag jekyll-sitemap]

        essential.each do |plugin|
          expect(plugins).to include(plugin),
                             "Missing essential plugin: #{plugin}"
        end
      end
    end

    describe 'theme configuration' do
      it 'has theme_config' do
        expect(config).to have_key('theme_config'),
                          '_config.yml should have theme_config'
      end

      it 'has appearance setting' do
        expect(config['theme_config']).to have_key('appearance'),
                                          'theme_config.appearance is required'
      end
    end
  end

  describe 'Essential Files' do
    ESSENTIAL_FILES.each do |file|
      it "has #{file}" do
        expect(File.exist?(File.join(Dir.pwd, file))).to be(true),
                                                         "Essential file '#{file}' not found"
      end
    end

    describe 'robots.txt' do
      let(:content) { File.read(File.join(Dir.pwd, 'robots.txt')) }

      it 'has User-agent directive' do
        expect(content).to include('User-agent'),
                           'robots.txt should have User-agent directive'
      end
    end

    describe 'site.webmanifest' do
      let(:content) { File.read(File.join(Dir.pwd, 'assets/favicons/site.webmanifest')) }
      let(:manifest) { JSON.parse(content) }

      it 'has valid JSON' do
        expect { JSON.parse(content) }.not_to raise_error
      end

      it 'has name' do
        expect(manifest).to have_key('name'),
                            'webmanifest should have name'
      end

      it 'has icons' do
        expect(manifest).to have_key('icons'),
                            'webmanifest should have icons'
      end
    end
  end
end
