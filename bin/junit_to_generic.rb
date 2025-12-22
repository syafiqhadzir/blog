#!/usr/bin/env ruby
# frozen_string_literal: true

require 'rexml/document'
require 'fileutils'

def convert_junit_to_generic
  junit_file = 'sonar-report.xml'
  generic_file = 'sonar-generic-report.xml'

  unless File.exist?(junit_file)
    puts "Error: #{junit_file} not found."
    exit 1
  end

  doc = REXML::Document.new(File.read(junit_file))
  root = doc.root

  # Create new Generic Test Data XML
  generic_doc = REXML::Document.new
  generic_doc << REXML::XMLDecl.new
  test_executions = generic_doc.add_element('testExecutions', { 'version' => '1' })

  root.elements.each('testcase') do |testcase|
    file_path = testcase.attributes['file']
    # Skip if no file attribute (shouldn't happen with RSpec JUnit formatter but good safety)
    next unless file_path

    # Extract test name and duration
    name = testcase.attributes['name']
    duration = (testcase.attributes['time'].to_f * 1000).to_i # convert seconds to ms

    file_element = test_executions.add_element('file', { 'path' => file_path })
    test_case_element = file_element.add_element('testCase', { 'name' => name, 'duration' => duration.to_s })

    # Check for failures or errors
    if (failure = testcase.elements['failure'])
      test_case_element.add_element('failure', { 'message' => failure.attributes['message'], 'stacktrace' => failure.text })
    elsif (error = testcase.elements['error'])
      test_case_element.add_element('error', { 'message' => error.attributes['message'], 'stacktrace' => error.text })
    elsif (skipped = testcase.elements['skipped'])
      test_case_element.add_element('skipped', { 'message' => skipped.attributes['message'] || 'Skipped' })
    end
  end

  # Write to file
  File.write(generic_file, '')
  generic_doc.write(File.open(generic_file, 'w'), 2)
  puts "Successfully converted #{junit_file} to #{generic_file}"
end

convert_junit_to_generic
