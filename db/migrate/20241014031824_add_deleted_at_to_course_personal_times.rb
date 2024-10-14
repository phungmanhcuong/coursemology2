class AddDeletedAtToCoursePersonalTimes < ActiveRecord::Migration[7.0]
  def change
    add_column :course_personal_times, :deleted_at, :datetime
    add_index :course_personal_times, :deleted_at
  end
end
