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
    generic_doc = REXML::Document.new
    generic_doc << REXML::XMLDecl.new
    test_executions = generic_doc.add_element('testExecutions', { 'version' => '1' })

    process_testcases(REXML::Document.new(File.read(JUNIT_FILE)).root, test_executions)
    write_report(generic_doc)
  end

  private

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
    name = testcase.attributes['name']
    duration = (testcase.attributes['time'].to_f * 1000).to_i
    test_case_element = file_element.add_element('testCase', { 'name' => name, 'duration' => duration.to_s })
    add_results(testcase, test_case_element)
  end

  def add_results(testcase, test_case_element)
    if (failure = testcase.elements['failure'])
      add_failure(failure, test_case_element)
    elsif (error = testcase.elements['error'])
      add_error(error, test_case_element)
    elsif (skipped = testcase.elements['skipped'])
      add_skipped(skipped, test_case_element)
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
