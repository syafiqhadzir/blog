# frozen_string_literal: true

require 'fastimage'

# Jekyll
module Jekyll
  # Module for processing AMP images
  module AmpFilter
    # Converts standard img tags to amp-img with auto-dimensions and WebP fallbacks
    class Converter
      IMG_TAG_REGEX = /<img\s+(.*?)>/i
      ATTR_REGEX = /([a-z]+)="([^"]*)"/i

      def self.process(doc)
        new(doc).process
      end

      def initialize(doc)
        @doc = doc
      end

      def process
        return unless @doc.output.include?('<img')

        @doc.output.gsub!(IMG_TAG_REGEX) do |match|
          replace_tag(match)
        end
      end

      private

      def replace_tag(match)
        attrs = parse_attributes(::Regexp.last_match(1))
        src = attrs['src']

        return match if should_skip?(match, src)

        local_path = File.join(@doc.site.source, src)
        return match unless file_exists?(local_path)

        convert_image(match, src, local_path, attrs)
      end

      def convert_image(match, src, local_path, attrs)
        width, height = FastImage.size(local_path)
        return match unless width && height

        generate_html(src, local_path, width, height, attrs)
      end

      def parse_attributes(attr_str)
        attrs = {}
        attr_str.scan(ATTR_REGEX) do |k, v|
          attrs[k.downcase] = v
        end
        attrs
      end

      def should_skip?(match, src)
        return true if match.include?('amp-img')

        if src.start_with?('http')
          warn "Warning: Remote image found in #{@doc.path}: #{src}. " \
               'Please turn this into <amp-img> manually with dimensions.'
          return true
        end
        false
      end

      def file_exists?(path)
        return true if File.exist?(path)

        warn "Warning: Image not found at #{path} in #{@doc.path}"
        false
      end

      def generate_html(src, local_path, width, height, attrs)
        webp_path = local_path.sub(/\.[^.]+$/, '.webp')
        has_webp = File.exist?(webp_path)

        if has_webp
          generate_webp_html(src, width, height, attrs)
        else
          generate_standard_html(src, width, height, attrs)
        end
      end

      def generate_webp_html(src, width, height, attrs)
        webp_src = src.sub(/\.[^.]+$/, '.webp')
        alt = attrs['alt']
        title_attr = attrs['title'] ? "title=\"#{attrs['title']}\"" : ''

        <<~HTML.strip
          <amp-img src="#{webp_src}" width="#{width}" height="#{height}" layout="responsive" alt="#{alt}" #{title_attr}>
            <amp-img fallback src="#{src}" width="#{width}" height="#{height}" layout="responsive" alt="#{alt}" #{title_attr}></amp-img>
          </amp-img>
        HTML
      end

      def generate_standard_html(src, width, height, attrs)
        alt = attrs['alt']
        title_attr = attrs['title'] ? "title=\"#{attrs['title']}\"" : ''

        "<amp-img src=\"#{src}\" width=\"#{width}\" height=\"#{height}\" " \
          "layout=\"responsive\" alt=\"#{alt}\" #{title_attr}></amp-img>"
      end
    end
  end

  Jekyll::Hooks.register [:posts, :pages], :post_render do |doc|
    Jekyll::AmpFilter::Converter.process(doc)
  end
end
