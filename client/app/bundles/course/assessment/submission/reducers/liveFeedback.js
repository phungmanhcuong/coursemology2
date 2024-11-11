import { produce } from 'immer';

import actions from '../constants';

const initialState = {
  feedbackUrl: null,
  feedbackByQuestion: {},
};

const convertFeedbackFilesToStrings = (feedbacks) => {
  if (feedbacks && Object.keys(feedbacks).length > 0) {
    return Object.keys(feedbacks).flatMap((fileName) =>
        feedbacks[fileName].map((file) => ({
          text: `Line ${file.linenum}: ${file.feedback}.\n`,
          sender: 'Codaveri',
          timestamp: new Date().toLocaleString(),
          isShowingPopup: false,
        })),
    );
  }
  return [];
};
export default function (state = initialState, action) {
  switch (action.type) {
    // case actions.LIVE_FEEDBACK_INITIAL: {
    //   const { questionId } = action.payload;
    //   return produce(state, (draft) => {
    //     if (!(questionId in draft)) {
    //       draft.feedbackByQuestion[questionId] = {
    //         isRequestingLiveFeedback: true,
    //         pendingFeedbackToken: null,
    //         answerId: null,
    //         liveFeedbackId: null,
    //         feedbackFiles: [],
    //         // isShowingPopup: false,
    //       };
    //     } else {
    //       draft.feedbackByQuestion[questionId] = {
    //         ...draft.feedbackByQuestion[questionId],
    //         isRequestingLiveFeedback: true,
    //         // isShowingPopup: false,
    //       };
    //     }
    //   });
    // }
    case actions.LIVE_FEEDBACK_REQUEST: {
      const { token, questionId, liveFeedbackId, feedbackUrl } = action.payload;
      return produce(state, (draft) => {
        draft.feedbackUrl ??= feedbackUrl;
        const feedbackFiles = draft.feedbackByQuestion[questionId]?.feedbackFiles ?? [];
        if (!(questionId in draft)) {
          draft.feedbackByQuestion[questionId] = {
            isRequestingLiveFeedback: false,
            liveFeedbackId,
            pendingFeedbackToken: token,
            feedbackFiles,
            isShowingPopup: true,
          };
        } else {
          draft.feedbackByQuestion[questionId] = {
            isRequestingLiveFeedback: false,
            ...draft.feedbackByQuestion[questionId],
            liveFeedbackId,
            pendingFeedbackToken: token,
            feedbackFiles,
            isShowingPopup: true,
          };
        }
      });
    }
    case actions.LIVE_FEEDBACK_SUCCESS: {
      const { questionId, answerId, feedbackFiles } = action.payload;
      const feedbackMessage = convertFeedbackFilesToStrings(feedbackFiles.reduce(
          (feedbackObj, feedbackFile) => ({
            ...feedbackObj,
            [feedbackFile.path]: feedbackFile.feedbackLines.map((line) => ({
              ...line,
              state: 'pending',
            })), // 'pending' | 'resolved' | 'dismissed'
          }),
          {},
      ))
      return produce(state, (draft) => {
        const newFeedbackFiles = [...draft.feedbackByQuestion[questionId].feedbackFiles, ...feedbackMessage];
        draft.feedbackByQuestion[questionId] = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          answerId,
          feedbackFiles: newFeedbackFiles,
          isShowingPopup: true,
        };
      });
    }

    case actions.LIVE_FEEDBACK_USER_REQUEST: {
      const { questionId, answerId, userRequest } = action.payload;
      return produce(state, (draft) => {
        const feedbackFiles =
            [
            ...draft.feedbackByQuestion[questionId]?.feedbackFiles ?? [], {
          text: userRequest,
          sender: 'User',
          timestamp: new Date().toLocaleString(),
        }];
        draft.feedbackByQuestion[questionId] = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          answerId,
          feedbackFiles,
          isShowingPopup: true,
        };
      });
    }

    case actions.LIVE_FEEDBACK_OPEN_POPUP: {
      console.log('OPEN_POPUP', action.payload);
      const { questionId, isShowingPopup } = action.payload;
      return produce(state, (draft) => {
        console.log('OPEN_POPUP', action.payload);
        draft.feedbackByQuestion[questionId] = draft.feedbackByQuestion[questionId] || {};
        draft.feedbackByQuestion[questionId].isShowingPopup = isShowingPopup;
      });
    }

    // case actions.LIVE_FEEDBACK_FAILURE: {
    //   const { questionId } = action.payload;
    //   return produce(state, (draft) => {
    //     draft.feedbackByQuestion[questionId] = {
    //       ...draft.feedbackByQuestion[questionId],
    //       isRequestingLiveFeedback: false,
    //       pendingFeedbackToken: null,
    //     };
    //   });
    // }
    // case actions.LIVE_FEEDBACK_ITEM_MARK_RESOLVED: {
    //   const { questionId, lineId, path } = action.payload;
    //   return produce(state, (draft) => {
    //     if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
    //       draft.feedbackByQuestion[questionId].feedbackFiles[path] =
    //         draft.feedbackByQuestion[questionId].feedbackFiles[path].map(
    //           (line) =>
    //             line.id === lineId ? { ...line, state: 'resolved' } : line,
    //         );
    //     }
    //   });
    // }
    // case actions.LIVE_FEEDBACK_ITEM_MARK_DISMISSED: {
    //   const { questionId, lineId, path } = action.payload;
    //   return produce(state, (draft) => {
    //     if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
    //       draft.feedbackByQuestion[questionId].feedbackFiles[path] =
    //         draft.feedbackByQuestion[questionId].feedbackFiles[path].map(
    //           (line) =>
    //             line.id === lineId ? { ...line, state: 'dismissed' } : line,
    //         );
    //     }
    //   });
    // }
    // case actions.LIVE_FEEDBACK_ITEM_DELETE: {
    //   const { questionId, lineId, path } = action.payload;
    //   return produce(state, (draft) => {
    //     if (path in draft.feedbackByQuestion[questionId].feedbackFiles) {
    //       draft.feedbackByQuestion[questionId].feedbackFiles[path] =
    //         draft.feedbackByQuestion[questionId].feedbackFiles[path].filter(
    //           (line) => line.id !== lineId,
    //         );
    //       if (
    //         !draft.feedbackByQuestion[questionId].feedbackFiles[path] ||
    //         draft.feedbackByQuestion[questionId].feedbackFiles[path].length ===
    //           0
    //       ) {
    //         delete draft.feedbackByQuestion[questionId].feedbackFiles[path];
    //       }
    //     }
    //   });
    // }
    default:
      return state;
  }
}
