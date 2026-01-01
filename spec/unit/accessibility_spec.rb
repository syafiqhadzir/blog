# frozen_string_literal: true

require_relative '../spec_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'Accessibility (A11y)' do
  describe 'Layouts accessibility' do
    it 'default.html has skip link' do
      content = File.read(File.join(layouts_dir, 'default.html'))
      expect(content).to include('skip-link').or(include('Skip to')),
                         'default.html should have a skip-to-content link'
    end

    it 'default.html has main landmark' do
      content = File.read(File.join(layouts_dir, 'default.html'))
      expect(content).to include('<main'),
                         'default.html should have a main element'
    end

    it 'default.html has footer with contentinfo' do
      content = File.read(File.join(layouts_dir, 'default.html'))
      expect(content).to include('role="contentinfo"').or(include('<footer')).or(include('include footer.html')),
                         'default.html should have a footer or contentinfo role'
    end

    it 'home.html has banner role' do
      content = File.read(File.join(layouts_dir, 'home.html'))
      expect(content).to include('role="banner"').or(include('<header')),
                         'home.html should have banner role or header element'
    end

    it 'home.html has navigation' do
      content = File.read(File.join(layouts_dir, 'home.html'))
      expect(content).to include('<nav').or(include('role="navigation"')),
                         'home.html should have navigation element'
    end

    it 'post.html has article element' do
      content = File.read(File.join(layouts_dir, 'post.html'))
      expect(content).to include('<article'),
                         'post.html should wrap content in article element'
    end
  end

  describe 'Includes accessibility' do
    it 'menu_item.html uses list structure' do
      content = File.read(File.join(includes_dir, 'menu_item.html'))
      expect(content).to include('<ul').and(include('<li')),
                         'menu_item.html should use list structure'
    end

    it 'back_link.html has aria-label' do
      content = File.read(File.join(includes_dir, 'back_link.html'))
      expect(content).to include('aria-label'),
                         'back_link.html should have aria-label'
    end

    it 'post_list.html uses semantic time element' do
      content = File.read(File.join(includes_dir, 'post_list.html'))
      expect(content).to include('<time'),
                         'post_list.html should use time element for dates'
    end
  end

  describe 'CSS accessibility' do
    it 'head.html has focus styles' do
      content = File.read(File.join(includes_dir, 'head.html'))
      expect(content).to include(':focus'),
                         'head.html should define focus styles for keyboard navigation'
    end

    it 'head.html has skip-link styles' do
      content = File.read(File.join(includes_dir, 'head.html'))
      expect(content).to include('.skip-link'),
                         'head.html should have skip-link CSS class'
    end

    it 'head.html has screen reader only styles' do
      content = File.read(File.join(includes_dir, 'head.html'))
      expect(content).to include('.sr-only').or(include('visually-hidden')),
                         'head.html should have screen reader only CSS class'
    end
  end
  # rubocop:enable RSpec/DescribeClass
end
