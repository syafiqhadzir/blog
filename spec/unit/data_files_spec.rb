# frozen_string_literal: true

require_relative '../spec_helper'

RSpec.describe 'Data Files' do
  describe '_data/menu.yml' do
    let(:menu_file) { File.join(data_dir, 'menu.yml') }
    let(:menu_data) { load_yaml(menu_file) }

    it 'exists' do
      expect(File.exist?(menu_file)).to be(true),
                                        'menu.yml not found in _data directory'
    end

    it 'has valid YAML syntax' do
      expect { load_yaml(menu_file) }.not_to raise_error
    end

    it 'has entries key' do
      expect(menu_data).to have_key('entries'),
                           'menu.yml must have an "entries" key'
    end

    it 'has at least one entry' do
      expect(menu_data['entries']).to be_an(Array),
                                      'entries must be an array'
      expect(menu_data['entries']).not_to be_empty,
                                          'entries array cannot be empty'
    end

    describe 'menu entries' do
      it 'each entry has a title' do
        menu_data['entries'].each_with_index do |entry, index|
          expect(entry).to have_key('title'),
                           "Entry #{index + 1}: Missing 'title' key"
        end
      end

      it 'entries with URLs have valid format' do
        entries_with_urls = menu_data['entries'].select { |e| e['url'] }

        entries_with_urls.each do |entry|
          url = entry['url']
          # Valid: relative paths, absolute paths, or external URLs
          expect(url).to match(%r{^(https?://|/|[a-zA-Z0-9])}),
                         "Invalid URL format: #{url}"
        end
      end

      it 'entries with post_list have valid configuration' do
        entries_with_post_list = menu_data['entries'].select { |e| e['post_list'] }

        entries_with_post_list.each do |entry|
          post_list = entry['post_list']

          if post_list['limit']
            expect(post_list['limit']).to be_a(Integer),
                                          'post_list.limit must be an integer'
            expect(post_list['limit']).to be > 0,
                                          'post_list.limit must be positive'
          end

          if post_list['show_more']
            expect(post_list['show_more']).to be(true).or(be(false)),
                                              'post_list.show_more must be a boolean'
          end
        end
      end
    end
  end

  describe 'All data files' do
    let(:data_files) { Dir.glob(File.join(data_dir, '*.{yml,yaml}')) }

    it 'have valid YAML syntax' do
      data_files.each do |file|
        expect { load_yaml(file) }.not_to raise_error,
                                          "Invalid YAML in #{File.basename(file)}"
      end
    end
  end
end
