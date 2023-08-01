import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';

import SummaryCard from 'lib/components/core/layouts/SummaryCard';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import CoursesButtons from '../components/buttons/CoursesButtons';
import CoursesTable from '../components/tables/CoursesTable';
import { deleteCourse, indexCourses } from '../operations';
import { getAdminCounts, getAllCourseMiniEntities } from '../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  title: {
    id: 'system.admin.admin.CoursesIndex.title',
    defaultMessage: 'Courses',
  },
  fetchCoursesFailure: {
    id: 'system.admin.admin.CoursesIndex.fetchCoursesFailure',
    defaultMessage: 'Failed to fetch courses.',
  },
  totalCourses: {
    id: 'system.admin.admin.CoursesIndex.totalCourses',
    defaultMessage: 'Total Courses: {count}',
  },
  activeCourses: {
    id: 'system.admin.admin.CoursesIndex.activeCourses',
    defaultMessage: 'Active Courses (in the past 7 days): {count}',
  },
});

const CoursesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ active: false });
  const courseCounts = useAppSelector(getAdminCounts);
  const courses = useAppSelector(getAllCourseMiniEntities);
  const dispatch = useAppDispatch();
  const totalCount =
    filter.active && courseCounts.totalCourses !== 0 ? (
      <Link onClick={(): void => setFilter({ active: false })}>
        {courseCounts.totalCourses}
      </Link>
    ) : (
      <strong>{courseCounts.totalCourses}</strong>
    );

  const activeCount =
    !filter.active && courseCounts.activeCourses !== 0 ? (
      <Link onClick={(): void => setFilter({ active: true })}>
        <strong>{courseCounts.activeCourses}</strong>
      </Link>
    ) : (
      <strong>{courseCounts.activeCourses}</strong>
    );

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      indexCourses({
        'filter[length]': DEFAULT_TABLE_ROWS_PER_PAGE,
        active: filter.active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchCoursesFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch, filter.active]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        {intl.formatMessage(translations.totalCourses, {
          count: totalCount,
        })}
      </Typography>
      <Typography variant="body2">
        {intl.formatMessage(translations.activeCourses, {
          count: activeCount,
        })}
      </Typography>
    </>
  );

  return (
    <>
      <SummaryCard className="mx-6 mt-6" renderContent={renderSummaryContent} />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <CoursesTable
          className="border-none"
          courses={courses}
          renderRowActionComponent={(course): JSX.Element => (
            <CoursesButtons course={course} deleteOperation={deleteCourse} />
          )}
        />
      )}
    </>
  );
};

export default injectIntl(CoursesIndex);
