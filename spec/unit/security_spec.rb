# frozen_string_literal: true

require_relative '../spec_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'Security Configuration' do
  describe 'security.txt' do
    let(:file_path) { File.join(Dir.pwd, 'security.txt') }
    let(:content) { File.read(file_path) }

    it 'exists' do
      expect(File.exist?(file_path)).to be(true),
                                        'security.txt not found'
    end

    it 'has Contact field (RFC 9116 required)' do
      # Strip Jekyll front matter for validation
      body = content.sub(/\A---.*?---\s*/m, '')
      expect(body).to include('Contact:'),
                      'security.txt must have Contact field per RFC 9116'
    end

    it 'has Expires field (RFC 9116 required)' do
      body = content.sub(/\A---.*?---\s*/m, '')
      expect(body).to include('Expires:'),
                      'security.txt must have Expires field per RFC 9116'
    end

    it 'has valid expiry date format' do
      body = content.sub(/\A---.*?---\s*/m, '')
      # ISO 8601 format: YYYY-MM-DDTHH:MM:SS.SSSZ
      expect(body).to match(/Expires:\s*\d{4}-\d{2}-\d{2}T/),
                      'Expires field must be in ISO 8601 format'
    end

    it 'expiry date is in the future' do
      body = content.sub(/\A---.*?---\s*/m, '')
      match = body.match(/Expires:\s*(\d{4}-\d{2}-\d{2})/)
      skip 'Could not parse expiry date' unless match

      expiry_date = Date.parse(match[1])
      expect(expiry_date).to be > Date.today,
                             'security.txt expiry date should be in the future'
    end

    it 'has Canonical field' do
      body = content.sub(/\A---.*?---\s*/m, '')
      expect(body).to include('Canonical:'),
                      'security.txt should have Canonical field'
    end

    it 'is served at correct path' do
      # Check permalink in front matter
      expect(content).to include('/.well-known/security.txt'),
                         'security.txt should be served at /.well-known/security.txt'
    end
  end

  describe 'robots.txt AI blocking' do
    let(:file_path) { File.join(Dir.pwd, 'robots.txt') }
    let(:content) { File.read(file_path) }

    # Major AI training bots that should be blocked
    let(:ai_bots) do
      %w[
        GPTBot
        ChatGPT-User
        CCBot
        anthropic-ai
        Google-Extended
        Bytespider
      ]
    end

    it 'blocks major AI training bots' do
      ai_bots.each do |bot|
        expect(content).to include("User-agent: #{bot}"),
                           "robots.txt should block #{bot}"
      end
    end

    it 'has Sitemap directive' do
      expect(content).to include('Sitemap:'),
                         'robots.txt should include Sitemap directive'
    end
  end

  describe 'Canonical URLs' do
    it '_layouts/default.html includes canonical logic' do
      default_layout = File.read(File.join(Dir.pwd, '_layouts', 'default.html'))
      head_include = File.read(File.join(Dir.pwd, '_includes', 'head.html'))

      has_canonical = default_layout.include?('canonical') || head_include.include?('canonical') || head_include.include?('seo')
      expect(has_canonical).to be(true),
                               'Site should include canonical URL in head'
    end
  end

  describe 'HTTPS enforcement' do
    let(:config) { load_yaml(File.join(Dir.pwd, '_config.yml')) }

    it 'site URL uses HTTPS' do
      expect(config['url']).to start_with('https://'),
                               'Site URL should use HTTPS'
    end
  end
end
# rubocop:enable RSpec/DescribeClass
