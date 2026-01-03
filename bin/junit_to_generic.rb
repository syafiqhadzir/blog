# !/usr/bin/env ruby
# frozen_string_literal: true

require 'rexml/document'
require 'fileutils'

# Converts JUnit XML reports to SonarQube's Generic Test Data format.
class JunitConverter
  JUNIT_FILE = 'sonar-report.xml'
  GENERIC_FILE = 'sonar-generic-report.xml'

  def convert
    validate_input
    doc = create_generic_document
    process_testcases(junit_root, doc.elements['testExecutions'])
    write_report(doc)
  end

  private

  def create_generic_document
    doc = REXML::Document.new
    doc << REXML::XMLDecl.new
    doc.add_element('testExecutions', { 'version' => '1' })
    doc
  end

  def junit_root
    REXML::Document.new(File.read(JUNIT_FILE)).root
  end

  def validate_input
    return if File.exist?(JUNIT_FILE)

    puts "Error: #{JUNIT_FILE} not found."
    exit 1
  end

  def process_testcases(root, test_executions)
    root.elements.each('testcase') do |testcase|
      file_path = testcase.attributes['file']
      next unless file_path

      file_element = test_executions.add_element('file', { 'path' => file_path })
      add_testcase(testcase, file_element)
    end
  end

  def add_testcase(testcase, file_element)
    attrs = testcase.attributes
    duration = (attrs['time'].to_f * 1000).to_i
    node = file_element.add_element('testCase', {
                                      'name' => attrs['name'],
                                      'duration' => duration.to_s
                                    })
    add_results(testcase, node)
  end

  def add_results(testcase, test_case_element)
    %w[failure error skipped].each do |type|
      element = testcase.elements[type]
      next unless element

      process_result(type, element, test_case_element)
      break
    end
  end

  def process_result(type, element, test_case_element)
    case type
    when 'failure' then add_failure(element, test_case_element)
    when 'error' then add_error(element, test_case_element)
    when 'skipped' then add_skipped(element, test_case_element)
    end
  end

  def add_failure(failure, element)
    element.add_element('failure', { 'message' => failure.attributes['message'], 'stacktrace' => failure.text })
  end

  def add_error(error, element)
    element.add_element('error', { 'message' => error.attributes['message'], 'stacktrace' => error.text })
  end

  def add_skipped(skipped, element)
    element.add_element('skipped', { 'message' => skipped.attributes['message'] || 'Skipped' })
  end

  def write_report(generic_doc)
    File.write(GENERIC_FILE, '')
    generic_doc.write(File.open(GENERIC_FILE, 'w'), 2)
    puts "Successfully converted #{JUNIT_FILE} to #{GENERIC_FILE}"
  end
end

JunitConverter.new.convert if __FILE__ == $PROGRAM_NAME
