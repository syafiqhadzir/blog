# frozen_string_literal: true

require_relative 'spec_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'Site Structure' do
  # Required layouts for the site
  let(:required_layouts) { ['default.html', 'post.html', 'page.html', 'home.html', 'archive.html'] }
  # Required includes for the site
  let(:required_includes) { ['head.html', 'menu_item.html', 'post_list.html'] }

  describe 'Layouts' do
    describe 'Required layouts' do
      it 'all required layouts exist' do
        required_layouts.each do |layout|
          layout_path = File.join(layouts_dir, layout)
          expect(File.exist?(layout_path)).to be(true),
                                              "Required layout '#{layout}' not found"
        end
      end
    end

    describe 'Layout front matter' do
      it 'all layouts except default.html have front matter' do
        layout_files = Dir.glob(File.join(layouts_dir, '*.html'))

        layout_files.each do |layout_file|
          layout_name = File.basename(layout_file)
          next if layout_name == 'default.html'

          content = File.read(layout_file)
          expect(content).to match(/\A---\s*\n.*?\n---/m),
                             "#{layout_name}: Missing front matter"
        end
      end
    end

    describe 'Layout content' do
      it 'default.html includes head.html' do
        content = File.read(File.join(layouts_dir, 'default.html'))
        expect(content).to include('include head.html'),
                           'default.html should include head.html'
      end

      it 'post.html extends default layout' do
        content = File.read(File.join(layouts_dir, 'post.html'))
        expect(content).to include('layout: default'),
                           'post.html should extend default layout'
      end

      it 'layouts contain content placeholder or extend default' do
        layout_files = Dir.glob(File.join(layouts_dir, '*.html'))

        layout_files.each do |layout_file|
          next if File.basename(layout_file) == 'default.html'

          content = File.read(layout_file)
          has_content = content.include?('{{ content }}') || content.include?('layout: default')
          expect(has_content).to be(true),
                                 "#{File.basename(layout_file)}: Should have {{ content }} or extend default layout"
        end
      end
    end
  end

  describe 'Includes' do
    describe 'Required includes' do
      it 'all required includes exist' do
        required_includes.each do |include_file|
          include_path = File.join(includes_dir, include_file)
          expect(File.exist?(include_path)).to be(true),
                                               "Required include '#{include_file}' not found"
        end
      end
    end

    describe 'Include content' do
      it 'head.html has meta charset' do
        content = File.read(File.join(includes_dir, 'head.html'))
        expect(content).to include('charset'),
                           'head.html should define character encoding'
      end

      it 'head.html has viewport meta' do
        content = File.read(File.join(includes_dir, 'head.html'))
        expect(content).to include('viewport'),
                           'head.html should define viewport for responsive design'
      end

      it 'head.html includes AMP script' do
        content = File.read(File.join(includes_dir, 'head.html'))
        expect(content).to include('cdn.ampproject.org'),
                           'head.html should include AMP JavaScript'
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
