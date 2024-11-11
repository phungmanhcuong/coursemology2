import { FC, useState } from 'react';
import { Box } from '@mui/material';

import actionTypes, {
  questionTypes,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import ContinueButton from './button/ContinueButton';
import LiveFeedbackButton from './button/LiveFeedbackButton';
import ResetProgrammingAnswerButton from './button/ResetProgrammingAnswerButton';
import SubmitButton from './button/SubmitButton';

interface Props {
  handleNext: () => void;
  stepIndex: number;
  setShowGetHelp: (show: boolean) => void;
}

const AutogradedActionButtonsRow: FC<Props> = (props) => {
  const { handleNext, stepIndex, setShowGetHelp } = props;
  const dispatch = useAppDispatch();
  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const { questionIds } = assessment;
  const { workflowState } = submission;

  const attempting = workflowState === workflowStates.Attempting;

  const questionId = questionIds[stepIndex];
  const question = questions[questionId];

  const handleLiveFeedbackClick = (): void => {
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_OPEN_POPUP,
      payload: {
        questionId,
        isShowingPopup: true,
      },
    });

    setShowGetHelp(true);
  };

  return (
    attempting && (
      <div className="flex flex-nowrap">
        <ResetProgrammingAnswerButton questionId={questionId} />
        <SubmitButton questionId={questionId} />
        <ContinueButton onContinue={handleNext} stepIndex={stepIndex} />
        <Box sx={{ flex: '1', width: '100%' }} />
        {question.type === questionTypes.Programming &&
          question.liveFeedbackEnabled && (
            <LiveFeedbackButton
              onClick={handleLiveFeedbackClick}
              questionId={questionId}
            />
          )}
      </div>
    )
  );
};

export default AutogradedActionButtonsRow;
