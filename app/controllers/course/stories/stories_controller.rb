# frozen_string_literal: true
class Course::Stories::StoriesController < Course::ComponentController
  include Signals::EmissionConcern
  include Course::CikgoChatsConcern

  signals :cikgo_open_threads_count, after: [:learn]

  before_action :check_course_user_and_push_key
  before_action -> { authorize!(:access_mission_control, current_course) }, only: [:mission_control]

  def learn
    url, @open_threads_count = find_or_create_room(current_course_user)

    render json: { redirectUrl: url }
  end

  def mission_control
    url, @pending_threads_count = get_mission_control_url(current_course_user)

    render json: { redirectUrl: url }
  end

  private

  def check_course_user_and_push_key
    head :not_found and return unless current_course_user.present? && push_key
  end

  def push_key
    current_course.settings(:course_stories_component).push_key
  end

  def component
    current_component_host[:course_stories_component]
  end
end