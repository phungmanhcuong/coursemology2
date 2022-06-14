# frozen_string_literal: true
json.id enrol_request.id
json.name enrol_request.user.name unless enrol_request.approved?
json.email enrol_request.user.email
json.status enrol_request.workflow_state
if enrol_request.approved?
  course_user = CourseUser.find_by(course_id: enrol_request.course_id, user_id: enrol_request.user_id)
  json.phantom course_user&.phantom || nil
  json.role course_user&.role || '-'
  json.name course_user&.name || enrol_request.user.name
end
json.createdAt format_datetime(enrol_request.created_at, :short)
json.confirmedBy enrol_request.confirmer.name unless enrol_request.pending?
json.confirmedAt format_datetime(enrol_request.confirmed_at, :short) unless enrol_request.pending?
# - if enrol_request.pending?
#   = content_tag_for(:tr, enrol_request,
#                     'data-action' => approve_course_enrol_request_path(current_course, enrol_request),
#                     'data-method' => 'patch', class: 'course-enrol-request')
#     = simple_fields_for CourseUser.new(name: enrol_request.user.name), wrapper: :inline_form do |f|
#       th = f.input :name
#       td = enrol_request.user.email
#       td = format_datetime(enrol_request.created_at)
#       td = f.input :role, as: :select, include_blank: false, collection: CourseUser.roles.keys
#       td = f.input :phantom, label: false
#       td
#         = f.button :submit, class: 'approve', title: t('.approve') do
#           = fa_icon 'check'.freeze
#         = link_to reject_course_enrol_request_path(current_course, enrol_request), class: ['btn', 'btn-danger'], title: t('.reject'), method: :patch do
#           = fa_icon 'trash'.freeze

# - elsif enrol_request.approved?
#   - course_user = CourseUser.find_by(course_id: enrol_request.course_id, user_id: enrol_request.user_id)
#   tr
#     td = course_user&.name || enrol_request.user.name
#     td = enrol_request.user.email
#     td = format_datetime(enrol_request.created_at)
#     td = course_user&.role || '-'
#     td = course_user&.phantom || '-'
#     td = enrol_request.confirmer.name
#     td = format_datetime(enrol_request.confirmed_at)

# - elsif enrol_request.rejected?
#   tr
#     td = enrol_request.user.name
#     td = enrol_request.user.email
#     td = format_datetime(enrol_request.created_at)
#     td = enrol_request.confirmer.name
#     td = format_datetime(enrol_request.confirmed_at)
