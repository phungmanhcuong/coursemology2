import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Divider, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import GetHelpPage from 'course/assessment/submission/pages/SubmissionEditIndex/components/GetHelpPage';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';

import { saveAnswer, updateClientVersion } from '../../actions/answers';
import { uploadTextResponseFiles } from '../../actions/answers/textResponse';
import useErrorTranslation from '../../pages/SubmissionEditIndex/useErrorTranslation';
import { ErrorType } from '../../pages/SubmissionEditIndex/validations/types';
import { updateAnswerFlagSavingStatus } from '../../reducers/answerFlags';
import { QuestionHistory } from '../../reducers/history/types';

import Answer from './Answer';
import AnswerHeader from './AnswerHeader';
import { AnswerPropsMap } from './types';

interface SubmissionAnswerProps<T extends keyof typeof QuestionType> {
  answerId: number | null;
  graderView: boolean;
  allErrors: ErrorType[];
  historyQuestions: Record<number, QuestionHistory>;
  question: SubmissionQuestionData<T>;
  questionType: T;
  readOnly: boolean;
  showMcqMrqSolution: boolean;
  stepIndex: number;
}

const DebounceDelayMap = {
  MultipleChoice: FIELD_LONG_DEBOUNCE_DELAY_MS,
  MultipleResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  Programming: FIELD_LONG_DEBOUNCE_DELAY_MS,
  TextResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  FileUpload: 0,
  Comprehension: FIELD_LONG_DEBOUNCE_DELAY_MS,
  VoiceResponse: 0,
  ForumPostResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  Scribing: 0,
};

const SubmissionAnswer = <T extends keyof typeof QuestionType>(
  props: SubmissionAnswerProps<T>,
): JSX.Element => {
  const {
    answerId,
    allErrors,
    graderView,
    historyQuestions,
    question,
    questionType,
    readOnly,
    showMcqMrqSolution,
    stepIndex,
  } = props;
  const dispatch = useAppDispatch();

  const { getValues, resetField } = useFormContext();
  const errorMessages = useErrorTranslation(allErrors);

  const liveFeedback = useAppSelector(
    (state) => state.assessments.submission.liveFeedback,
  );

  const questionId = question.id;
  const isShowingPopup =
    liveFeedback?.feedbackByQuestion?.[questionId]?.isShowingPopup ?? false;

  const handleSaveAnswer = (
    answerData: unknown,
    savedAnswerId: number,
    currentTime: number,
  ): void => {
    dispatch(saveAnswer(answerData, savedAnswerId, currentTime, resetField));
  };

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    DebounceDelayMap[questionType],
    [],
  );

  const saveAnswerAndUpdateClientVersion = (saveAnswerId: number): void => {
    const answer = getValues()[saveAnswerId];
    const currentTime = Date.now();
    dispatch(updateClientVersion(saveAnswerId, currentTime));
    dispatch(
      updateAnswerFlagSavingStatus({
        answer: { id: saveAnswerId },
        savingStatus: 'None',
      }),
    );
    debouncedSaveAnswer(answer, saveAnswerId, currentTime);
  };

  const handleUploadTextResponseFiles = (savedAnswerId: number): void => {
    const answer = getValues()[savedAnswerId];

    dispatch(uploadTextResponseFiles(savedAnswerId, answer, resetField));
  };

  const answerPropsMap: AnswerPropsMap = {
    MultipleChoice: {
      answerId,
      question: question as SubmissionQuestionData<'MultipleChoice'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    MultipleResponse: {
      answerId,
      question: question as SubmissionQuestionData<'MultipleResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    Programming: {
      answerId,
      question: question as SubmissionQuestionData<'Programming'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    TextResponse: {
      answerId,
      question: question as SubmissionQuestionData<'TextResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      handleUploadTextResponseFiles,
    },
    FileUpload: {
      answerId,
      question: question as SubmissionQuestionData<'FileUpload'>,
      readOnly,
      graderView,
      handleUploadTextResponseFiles,
    },
    Comprehension: {},
    VoiceResponse: {
      answerId,
      question: question as SubmissionQuestionData<'VoiceResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    ForumPostResponse: {
      answerId,
      question: question as SubmissionQuestionData<'ForumPostResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    Scribing: {
      answerId,
      question: question as SubmissionQuestionData<'Scribing'>,
    },
  };

  return (
    <>
      <AnswerHeader
        answerId={answerId}
        historyQuestions={historyQuestions}
        question={question}
      />
      <Divider />

      {errorMessages.map((message) => (
        <Typography key={message} className="text-error" variant="body2">
          {message}
        </Typography>
      ))}

      <Typography className="mt-2" variant="body1">
        {question.questionTitle ?? ''}
      </Typography>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />

      <Divider />
      <Answer
        answerId={answerId}
        answerProps={answerPropsMap[questionType]}
        question={question}
        questionType={questionType}
      />
      {isShowingPopup && <GetHelpPage stepIndex={stepIndex} />}
    </>
  );
};

export default memo(SubmissionAnswer, equal);
