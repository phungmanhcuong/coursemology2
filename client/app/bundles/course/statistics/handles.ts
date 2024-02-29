import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

export const videoWatchHistoryHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  const userId = getIdFromUnknown(match.params?.userId);
  if (!userId) throw new Error(`Invalid user id: ${userId}`);

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.users.fetch(userId);

      return {
        activePath: `/courses/${courseId}/statistics/students`,
        content: [
          {
            title: data.user.name,
            url: `users/${data.user.id}/video_submissions`,
          },
        ],
      };
    },
  };
};
