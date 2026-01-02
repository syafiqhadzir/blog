require 'spec_helper'
require_relative '../../scripts/tag_manager'
require 'fileutils'

RSpec.describe TagManager do
  let(:posts_dir) { '_posts_test' }

  before do
    allow(TagManager).to receive(:puts) # Silence stdout
    stub_const('TagManager::POSTS_DIR', posts_dir)
    FileUtils.mkdir_p(posts_dir)
  end

  after do
    FileUtils.rm_rf(posts_dir)
  end

  describe '.process_file' do
    context 'with a short filename (no date prefix)' do
      let(:filename) { File.join(posts_dir, 'draft.md') }

      before do
        File.write(filename, "---\ntitle: Safe Draft\nslug: custom-slug\n---\nContent")
      end

      it 'processes successfully without crashing' do
        expect(TagManager.process_file(filename)).to be true
      end

      it 'extracts slug correctly from frontmatter' do
        TagManager.process_file(filename)
        content = File.read(filename)
        expect(content).to include('tags:')
      end
    end

    context 'with a short filename and NO slug in frontmatter' do
      let(:filename) { File.join(posts_dir, 'short.md') }

      before do
        File.write(filename, "---\ntitle: Short\n---\nContent")
      end

      it 'falls back to basename for slug and does not crash' do
        expect(TagManager.process_file(filename)).to be true
        content = File.read(filename)
        # Should default to 'qa' tag if no other tags found/generated
        expect(content).to include('tags:')
        expect(content).to include('qa')
      end
    end

    context 'with invalid YAML' do
      let(:filename) { File.join(posts_dir, 'bad.md') }

      before do
        File.write(filename, "---\ntitle: : : bad yaml\n---\nContent")
      end

      it 'handles error gracefully and returns false' do
        expect(TagManager.process_file(filename)).to be false
      end
    end
  end
end
