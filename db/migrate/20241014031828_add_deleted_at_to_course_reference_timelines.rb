class AddDeletedAtToCourseReferenceTimelines < ActiveRecord::Migration[7.0]
  def change
    add_column :course_reference_timelines, :deleted_at, :datetime
    add_index :course_reference_timelines, :deleted_at
  end
end
