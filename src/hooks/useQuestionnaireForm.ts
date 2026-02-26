"use client";

import { useReducer, useCallback } from "react";
import {
  QuestionnaireData,
  INITIAL_QUESTIONNAIRE,
  toApiPayload,
} from "@/types/questionnaire";

type Action =
  | { type: "SET_FIELD"; field: keyof QuestionnaireData; value: unknown }
  | { type: "TOGGLE_IN_LIST"; field: keyof QuestionnaireData; value: string }
  | { type: "ADD_TO_LIST"; field: keyof QuestionnaireData; value: string }
  | { type: "REMOVE_FROM_LIST"; field: keyof QuestionnaireData; value: string };

function reducer(
  state: QuestionnaireData,
  action: Action,
): QuestionnaireData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "TOGGLE_IN_LIST": {
      const list = state[action.field] as string[];
      const exists = list.includes(action.value);
      return {
        ...state,
        [action.field]: exists
          ? list.filter((v) => v !== action.value)
          : [...list, action.value],
      };
    }

    case "ADD_TO_LIST": {
      const list = state[action.field] as string[];
      if (list.includes(action.value)) return state;
      return { ...state, [action.field]: [...list, action.value] };
    }

    case "REMOVE_FROM_LIST": {
      const list = state[action.field] as string[];
      return {
        ...state,
        [action.field]: list.filter((v) => v !== action.value),
      };
    }

    default:
      return state;
  }
}

export function useQuestionnaireForm() {
  const [data, dispatch] = useReducer(reducer, INITIAL_QUESTIONNAIRE);

  const setField = useCallback(
    (field: keyof QuestionnaireData, value: unknown) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  const toggleInList = useCallback(
    (field: keyof QuestionnaireData, value: string) => {
      dispatch({ type: "TOGGLE_IN_LIST", field, value });
    },
    [],
  );

  const addToList = useCallback(
    (field: keyof QuestionnaireData, value: string) => {
      dispatch({ type: "ADD_TO_LIST", field, value });
    },
    [],
  );

  const removeFromList = useCallback(
    (field: keyof QuestionnaireData, value: string) => {
      dispatch({ type: "REMOVE_FROM_LIST", field, value });
    },
    [],
  );

  const getApiPayload = useCallback(() => toApiPayload(data), [data]);

  return { data, setField, toggleInList, addToList, removeFromList, getApiPayload };
}
