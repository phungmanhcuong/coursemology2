class AddDeletedAtToCourseExperiencePointsRecords < ActiveRecord::Migration[7.0]
  def change
    add_column :course_experience_points_records, :deleted_at, :datetime
    add_index :course_experience_points_records, :deleted_at
  end
end
