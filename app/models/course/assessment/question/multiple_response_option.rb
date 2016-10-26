# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponseOption < ActiveRecord::Base
  acts_as_duplicable

  belongs_to :question, class_name: Course::Assessment::Question::MultipleResponse.name,
                        inverse_of: :options

  # @!method self.correct
  #   Gets the options which are marked as correct.
  scope :correct, ->() { where(correct: true) }

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
  end
end
