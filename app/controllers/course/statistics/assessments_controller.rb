# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern

  def main_statistics
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade, :question_count).
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user],
                          course: :course_users).first
    submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id]).
                  calculated(:grade, :grader_ids).
                  preload(:answers, creator: :course_users)
    @course_users_hash = preload_course_users_hash(current_course)

    load_course_user_students
    fetch_all_ancestor_assessments
    create_question_related_hash
    @student_submissions_hash = fetch_hash_for_main_assessment(submissions, @all_students)
  end

  def ancestor_statistics
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade).
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user],
                          course: :course_users).first
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)

    load_course_user_students

    @student_submissions_hash = fetch_hash_for_ancestor_assessment(submissions, @all_students)
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def load_course_user_students
    @all_students = @assessment.course.course_users.students
  end

  def fetch_all_ancestor_assessments
    current_assessment = Course::Assessment.preload(:duplication_traceable).find(assessment_params[:id])
    @ancestors = [current_assessment]
    while current_assessment.duplication_traceable.present? &&
          current_assessment.duplication_traceable.source_id.present?
      current_assessment = current_assessment.duplication_traceable.source
      break unless can?(:read_ancestor, current_assessment)

      @ancestors.unshift(current_assessment)
    end
  end

  def create_question_related_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
    @question_maximum_grade_hash = @assessment.questions.to_h do |q|
      [q.id, q.maximum_grade]
    end
  end
end
