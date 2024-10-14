class AddDeletedAtToCourseUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :course_users, :deleted_at, :datetime
    add_index :course_users, :deleted_at
  end
end
