import {
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import {
  HistoryQuestion,
  QuestionFlags,
  SubmissionQuestionData,
} from '../questionGrade';
import translations from '../translations';

import Answer from './Answer';

interface Props {
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void;
  historyQuestions: Record<string, HistoryQuestion>;
  questionsFlags: Record<string, QuestionFlags>;
  readOnly?: boolean;
  graderView: boolean;
  showMcqMrqSolution: boolean;
  question: SubmissionQuestionData;
  answerId: number;
  onSaveAnswer: (data: unknown, answerId: number) => void;
}

const SubmissionAnswer = (props: Props): JSX.Element => {
  const {
    handleToggleViewHistoryMode,
    historyQuestions,
    questionsFlags,
    readOnly = false,
    graderView,
    showMcqMrqSolution,
    question,
    answerId,
    onSaveAnswer,
  } = props;

  const { t } = useTranslation();

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const isAutograding = questionsFlags[question.id]
    ? questionsFlags[question.id].isAutograding
    : false;
  const disabled = noPastAnswers || isLoading || isAutograding;

  const debouncedSaveAnswer = useDebounce(
    onSaveAnswer,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const HistoryToggle = (): JSX.Element | null => {
    return question.canViewHistory ? (
      <div className="inline-block float-right">
        {isLoading ? (
          <CircularProgress className="inline-block align-middle" size={30} />
        ) : null}
        <Tooltip title={noPastAnswers ? t(translations.noPastAnswers) : ''}>
          <FormControlLabel
            className="float-right"
            control={
              <Switch
                checked={question.viewHistory || false}
                className="toggle-history"
                color="primary"
                onChange={(): void =>
                  handleToggleViewHistoryMode(
                    !question.viewHistory,
                    question.submissionQuestionId,
                    question.id,
                  )
                }
              />
            }
            disabled={disabled}
            label={<b>{t(translations.viewPastAnswers)}</b>}
            labelPlacement="start"
          />
        </Tooltip>
      </div>
    ) : null;
  };

  const MissingAnswer = (): JSX.Element => {
    return <Alert severity="warning">{t(translations.missingAnswer)}</Alert>;
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography variant="h6">{question.displayTitle}</Typography>
        <HistoryToggle />
      </div>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />
      {readOnly && <Divider />}
      {answerId ? (
        <Answer
          answerId={answerId}
          graderView={graderView}
          question={question}
          readOnly={readOnly}
          saveAnswer={debouncedSaveAnswer}
          showMcqMrqSolution={showMcqMrqSolution}
        />
      ) : (
        <MissingAnswer />
      )}
    </>
  );
};

export default SubmissionAnswer;