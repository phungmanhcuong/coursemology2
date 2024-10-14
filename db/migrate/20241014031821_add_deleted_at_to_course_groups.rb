class AddDeletedAtToCourseGroups < ActiveRecord::Migration[7.0]
  def change
    add_column :course_groups, :deleted_at, :datetime
    add_index :course_groups, :deleted_at
  end
end
