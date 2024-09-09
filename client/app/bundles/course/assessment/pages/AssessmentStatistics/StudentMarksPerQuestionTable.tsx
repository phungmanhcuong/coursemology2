import { FC, ReactNode, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Chip } from '@mui/material';
import palette from 'theme/palette';
import { MainSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import { workflowStates } from 'course/assessment/submission/constants';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import TableLegends from 'lib/containers/TableLegends';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import LastAttemptIndex from './AnswerDisplay/LastAttempt';
import { getClassNameForMarkCell } from './classNameUtils';
import { getAssessmentStatistics } from './selectors';

const translations = defineMessages({
  name: {
    id: 'course.assessment.statistics.name',
    defaultMessage: 'Name',
  },
  greenCellLegend: {
    id: 'course.assessment.statistics.greenCellLegend',
    defaultMessage: '>= 0.5 * Maximum Grade',
  },
  redCellLegend: {
    id: 'course.assessment.statistics.redCellLegend',
    defaultMessage: '< 0.5 * Maximum Grade',
  },
  group: {
    id: 'course.assessment.statistics.group',
    defaultMessage: 'Group',
  },
  totalGrade: {
    id: 'course.assessment.statistics.totalGrade',
    defaultMessage: 'Total',
  },
  grader: {
    id: 'course.assessment.statistics.grader',
    defaultMessage: 'Grader',
  },
  searchText: {
    id: 'course.assessment.statistics.searchText',
    defaultMessage: 'Search by Student Name, Group or Grader Name',
  },
  answers: {
    id: 'course.assessment.statistics.answers',
    defaultMessage: 'Answers',
  },
  questionIndex: {
    id: 'course.assessment.statistics.questionIndex',
    defaultMessage: 'Q{index}',
  },
  noSubmission: {
    id: 'course.assessment.statistics.noSubmission',
    defaultMessage: 'No Submission yet',
  },
  workflowState: {
    id: 'course.assessment.statistics.workflowState',
    defaultMessage: 'Status',
  },
  filename: {
    id: 'course.assessment.statistics.filename',
    defaultMessage: 'Question-level Marks Statistics for {assessment}',
  },
  close: {
    id: 'course.assessment.statistics.close',
    defaultMessage: 'Close',
  },
});

interface Props {
  includePhantom: boolean;
}

const statusTranslations = {
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unstarted: 'Not Started',
};

const StudentMarksPerQuestionTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const { includePhantom } = props;

  const statistics = useAppSelector(getAssessmentStatistics);
  const [openAnswer, setOpenAnswer] = useState(false);
  const [answerDisplayInfo, setAnswerDisplayInfo] = useState({
    index: 0,
    answerId: 0,
    studentName: '',
  });
  const assessment = statistics.assessment;
  const submissions = statistics.submissions;

  // since submissions come from Redux store, it is immutable, and hence
  // toggling between includePhantom status will render typeError if we
  // use submissions. Hence the reason of using slice in here, basically
  // creating a new array and use this instead for the display.
  const filteredSubmissions = includePhantom
    ? submissions.slice()
    : submissions.slice().filter((s) => !s.courseUser.isPhantom);

  const sortedSubmission = filteredSubmissions
    .sort((datum1, datum2) =>
      datum1.courseUser.name.localeCompare(datum2.courseUser.name),
    )
    .sort(
      (datum1, datum2) =>
        Number(datum1.courseUser.isPhantom) -
        Number(datum2.courseUser.isPhantom),
    );

  // the case where the grade is null is handled separately inside the column
  // (refer to the definition of answerColumns below)
  const renderAnswerGradeClickableCell = (
    index: number,
    datum: MainSubmissionInfo,
  ): ReactNode => {
    const className = getClassNameForMarkCell(
      datum.answers![index].grade,
      datum.answers![index].maximumGrade,
    );
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={(): void => {
          setOpenAnswer(true);
          setAnswerDisplayInfo({
            index: index + 1,
            answerId: datum.answers![index].lastAttemptAnswerId,
            studentName: datum.courseUser.name,
          });
        }}
      >
        <Box>{datum.answers![index].grade.toFixed(1)}</Box>
      </div>
    );
  };

  const renderTotalGradeCell = (
    totalGrade: number,
    maxGrade: number,
  ): ReactNode => {
    const className = getClassNameForMarkCell(totalGrade, maxGrade);
    return (
      <div className={className}>
        <Box>{totalGrade.toFixed(1)}</Box>
      </div>
    );
  };

  const answerColumns: ColumnTemplate<MainSubmissionInfo>[] = Array.from(
    { length: assessment?.questionCount ?? 0 },
    (_, index) => {
      return {
        searchProps: {
          getValue: (datum) =>
            datum.answers?.[index]?.grade?.toString() ?? undefined,
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return typeof datum.answers?.[index].grade === 'number' ? (
            renderAnswerGradeClickableCell(index, datum)
          ) : (
            <div />
          );
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          undefinedPriority: 'last',
        },
      };
    },
  );

  const jointGroupsName = (datum: MainSubmissionInfo): string =>
    datum.groups
      ? datum.groups
          .map((g) => g.name)
          .sort()
          .join(', ')
      : '';

  const columns: ColumnTemplate<MainSubmissionInfo>[] = [
    {
      searchProps: {
        getValue: (datum) => datum.courseUser.name,
      },
      title: t(translations.name),
      sortable: true,
      searchable: true,
      cell: (datum) => (
        <div className="flex grow items-center">
          <Link to={`/courses/${courseId}/users/${datum.courseUser.id}`}>
            {datum.courseUser.name}
          </Link>
          {datum.courseUser.isPhantom && (
            <GhostIcon className="ml-2" fontSize="small" />
          )}
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => jointGroupsName(datum),
      },
      cell: (datum) => jointGroupsName(datum),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      cell: (datum) => (
        <Link
          opensInNewTab
          to={getEditSubmissionURL(courseId, assessmentId, datum.id)}
        >
          <Chip
            className={`text-blue-800 ${palette.submissionStatusClassName[datum.workflowState ?? workflowStates.Unstarted]} w-full`}
            label={
              statusTranslations[
                datum.workflowState ?? workflowStates.Unstarted
              ]
            }
            variant="filled"
          />
        </Link>
      ),
      className: 'center',
    },
    ...answerColumns,
    {
      searchProps: {
        getValue: (datum) => datum.totalGrade?.toString() ?? undefined,
      },
      title: t(translations.totalGrade),
      sortable: true,
      cell: (datum): ReactNode => {
        const isGradedOrPublished =
          datum.workflowState === workflowStates.Graded ||
          datum.workflowState === workflowStates.Published;
        return datum.totalGrade && isGradedOrPublished ? (
          renderTotalGradeCell(datum.totalGrade, assessment!.maximumGrade)
        ) : (
          <div />
        );
      },

      className: 'text-right',
      sortProps: {
        undefinedPriority: 'last',
      },
      csvDownloadable: true,
    },
    {
      searchProps: {
        getValue: (datum) => datum.grader?.name ?? '',
      },
      title: t(translations.grader),
      sortable: true,
      searchable: true,
      cell: (datum): JSX.Element | string => {
        if (datum.grader && datum.grader.id !== 0) {
          return (
            <Link to={`/courses/${courseId}/users/${datum.grader.id}`}>
              {datum.grader.name}
            </Link>
          );
        }
        return datum.grader?.name ?? '';
      },
      csvDownloadable: true,
    },
  ];

  return (
    <>
      <TableLegends
        legends={[
          {
            key: 'correct',
            backgroundColor: 'bg-green-500',
            description: t(translations.greenCellLegend),
          },
          {
            key: 'incorrect',
            backgroundColor: 'bg-red-500',
            description: t(translations.redCellLegend),
          },
        ]}
      />
      <Table
        columns={columns}
        csvDownload={{
          filename: t(translations.filename, {
            assessment: assessment?.title ?? '',
          }),
        }}
        data={sortedSubmission}
        getRowClassName={(datum): string =>
          `data_${datum.courseUser.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(datum): MainSubmissionInfo => datum}
        getRowId={(datum): string => datum.courseUser.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{ searchPlaceholder: t(translations.searchText) }}
        toolbar={{ show: true }}
      />
      <Prompt
        cancelLabel={t(translations.close)}
        maxWidth="lg"
        onClose={(): void => setOpenAnswer(false)}
        open={openAnswer}
        title={answerDisplayInfo.studentName}
      >
        <LastAttemptIndex
          curAnswerId={answerDisplayInfo.answerId}
          index={answerDisplayInfo.index}
        />
      </Prompt>
    </>
  );
};

export default StudentMarksPerQuestionTable;
