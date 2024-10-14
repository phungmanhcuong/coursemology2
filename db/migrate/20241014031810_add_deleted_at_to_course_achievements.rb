class AddDeletedAtToCourseAchievements < ActiveRecord::Migration[7.0]
  def change
    add_column :course_achievements, :deleted_at, :datetime
    add_index :course_achievements, :deleted_at
  end
end
