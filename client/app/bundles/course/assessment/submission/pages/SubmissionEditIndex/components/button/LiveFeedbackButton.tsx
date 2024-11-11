import { FC } from 'react';
import { Button } from '@mui/material';

import { getLiveFeedbacks } from 'course/assessment/submission/selectors/liveFeedbacks';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
  onClick?: () => void; // Make the onClick prop optional
}

const LiveFeedbackButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionId, onClick } = props; // Destructure onClick prop
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);
  const liveFeedback = useAppSelector(getLiveFeedbacks);

  const question = questions[questionId];

  const { graderView } = submission;
  const { attemptsLeft } = question;
  const { isResetting } = questionFlags[questionId] || {};

  const isRequestingLiveFeedback =
    liveFeedback?.feedbackByQuestion?.[questionId]?.isRequestingLiveFeedback ??
    false;

  const isPollingLiveFeedback =
    (liveFeedback?.feedbackByQuestion?.[questionId]?.pendingFeedbackToken ??
      false) !== false;

  // TODO: update logic pending #7418: allow [Live feedback] on all programming questions

  return (
    <Button
      className="mb-2 mr-2"
      color="info"
      disabled={
        isResetting ||
        isRequestingLiveFeedback ||
        isPollingLiveFeedback ||
        (!graderView && attemptsLeft === 0)
      }
      id="get-live-feedback"
      onClick={onClick} // Use the onClick prop if provided and then call onGenerateLiveFeedback
      startIcon={
        (isRequestingLiveFeedback || isPollingLiveFeedback) && (
          <LoadingIndicator bare size={20} />
        )
      }
      variant="contained"
    >
      {t(translations.generateCodaveriLiveFeedback)}
    </Button>
  );
};

export default LiveFeedbackButton;
