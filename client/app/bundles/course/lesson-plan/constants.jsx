import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['EVENT', 'MILESTONE']);

export const fields = mirrorCreator([
  'ITEM_TYPE',
  'TITLE',
  'START_AT',
  'BONUS_END_AT',
  'END_AT',
  'PUBLISHED',
  'LOCATION',
  'DESCRIPTION',
  'EVENT_TYPE',
]);

const actionTypes = mirrorCreator([
  'SET_ITEM_TYPE_VISIBILITY',
  'SET_COLUMN_VISIBILITY',
  'LOAD_LESSON_PLAN_REQUEST',
  'LOAD_LESSON_PLAN_SUCCESS',
  'LOAD_LESSON_PLAN_FAILURE',
  'ITEM_UPDATE_REQUEST',
  'ITEM_UPDATE_SUCCESS',
  'ITEM_UPDATE_FAILURE',
  'EVENT_FORM_SHOW',
  'EVENT_FORM_HIDE',
  'EVENT_UPDATE_REQUEST',
  'EVENT_UPDATE_SUCCESS',
  'EVENT_UPDATE_FAILURE',
  'EVENT_CREATE_REQUEST',
  'EVENT_CREATE_SUCCESS',
  'EVENT_CREATE_FAILURE',
  'EVENT_DELETE_REQUEST',
  'EVENT_DELETE_SUCCESS',
  'EVENT_DELETE_FAILURE',
  'MILESTONE_FORM_SHOW',
  'MILESTONE_FORM_HIDE',
  'MILESTONE_UPDATE_REQUEST',
  'MILESTONE_UPDATE_SUCCESS',
  'MILESTONE_UPDATE_FAILURE',
  'MILESTONE_CREATE_REQUEST',
  'MILESTONE_CREATE_SUCCESS',
  'MILESTONE_CREATE_FAILURE',
  'MILESTONE_DELETE_REQUEST',
  'MILESTONE_DELETE_SUCCESS',
  'MILESTONE_DELETE_FAILURE',
]);

export default actionTypes;
