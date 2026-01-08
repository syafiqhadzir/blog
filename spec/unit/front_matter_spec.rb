# frozen_string_literal: true

require_relative '../spec_helper'

RSpec.describe 'Post Front Matter' do
  # Required front matter keys for all posts (date optional since Jekyll infers from filename)
  REQUIRED_KEYS = %w[title layout].freeze

  # Valid layouts for posts
  VALID_LAYOUTS = %w[post default page].freeze

  describe 'All posts' do
    it 'exist in the _posts directory' do
      expect(post_files).not_to be_empty,
                                'No posts found in _posts directory'
    end

    it 'have valid front matter with required keys' do
      post_files.each do |post_file|
        post_name = File.basename(post_file)
        front_matter = parse_front_matter(post_file)

        expect(front_matter).not_to be_empty,
                                    "#{post_name}: Missing or invalid front matter"

        REQUIRED_KEYS.each do |key|
          expect(front_matter).to have_key(key),
                                  "#{post_name}: Missing required key '#{key}'"
        end
      end
    end

    it 'have non-empty titles' do
      post_files.each do |post_file|
        post_name = File.basename(post_file)
        front_matter = parse_front_matter(post_file)

        expect(front_matter['title']).to be_a(String),
                                         "#{post_name}: Title must be a string"
        expect(front_matter['title'].strip).not_to be_empty,
                                                   "#{post_name}: Title cannot be empty"
      end
    end

    it 'have valid layouts' do
      post_files.each do |post_file|
        post_name = File.basename(post_file)
        front_matter = parse_front_matter(post_file)
        layout = front_matter['layout']

        expect(VALID_LAYOUTS).to include(layout),
                                 "#{post_name}: Invalid layout '#{layout}'. Must be one of: #{VALID_LAYOUTS.join(', ')}"
      end
    end

    it 'have filenames matching Jekyll convention (YYYY-MM-DD-slug.md)' do
      post_files.each do |post_file|
        filename = File.basename(post_file)

        expect(filename).to match(/^\d{4}-\d{2}-\d{2}-.+\.md$/),
                            "#{filename}: Filename must follow YYYY-MM-DD-slug.md convention"
      end
    end

    it 'have valid dates extractable from filename' do
      post_files.each do |post_file|
        filename = File.basename(post_file)
        date_str = filename[0..9] # Extract YYYY-MM-DD from filename

        expect { Date.parse(date_str) }.not_to raise_error,
                                               "#{filename}: Invalid date in filename"
      end
    end
  end

  describe 'Post uniqueness' do
    it 'has no duplicate titles' do
      titles = post_files.filter_map do |file|
        front_matter = parse_front_matter(file)
        front_matter['title']
      end

      duplicates = titles.group_by(&:itself).select { |_, v| v.size > 1 }.keys

      expect(duplicates).to be_empty,
                            "Duplicate post titles found: #{duplicates.join(', ')}"
    end
  end
end
