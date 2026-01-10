# frozen_string_literal: true

require_relative 'spec_helper'

# rubocop:disable RSpec/DescribeClass
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

    describe 'entries with post_list' do
      let(:entries_with_post_list) { menu_data['entries'].select { |e| e['post_list'] } }

      it 'have valid limit configuration' do
        entries_with_post_list.each do |entry|
          post_list = entry['post_list']
          next unless post_list['limit']

          expect(post_list['limit']).to be_a(Integer)
          expect(post_list['limit']).to be_positive
        end
      end

      it 'have valid show_more configuration' do
        entries_with_post_list.each do |entry|
          post_list = entry['post_list']
          next unless post_list['show_more']

          expect(post_list['show_more']).to be(true).or(be(false))
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
# rubocop:enable RSpec/DescribeClass
