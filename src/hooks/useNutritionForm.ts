"use client";

import { useReducer, useCallback } from "react";
import {
  NutritionQuestionnaireData,
  INITIAL_NUTRITION,
  toNutritionApiPayload,
  WorkoutDaySummary,
} from "@/types/nutrition";

type Action =
  | { type: "SET_FIELD"; field: keyof NutritionQuestionnaireData; value: unknown }
  | { type: "TOGGLE_IN_LIST"; field: keyof NutritionQuestionnaireData; value: string }
  | { type: "ADD_TO_LIST"; field: keyof NutritionQuestionnaireData; value: string }
  | { type: "REMOVE_FROM_LIST"; field: keyof NutritionQuestionnaireData; value: string };

function reducer(
  state: NutritionQuestionnaireData,
  action: Action,
): NutritionQuestionnaireData {
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

export function useNutritionForm() {
  const [data, dispatch] = useReducer(reducer, INITIAL_NUTRITION);

  const setField = useCallback(
    (field: keyof NutritionQuestionnaireData, value: unknown) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  const toggleInList = useCallback(
    (field: keyof NutritionQuestionnaireData, value: string) => {
      dispatch({ type: "TOGGLE_IN_LIST", field, value });
    },
    [],
  );

  const addToList = useCallback(
    (field: keyof NutritionQuestionnaireData, value: string) => {
      dispatch({ type: "ADD_TO_LIST", field, value });
    },
    [],
  );

  const removeFromList = useCallback(
    (field: keyof NutritionQuestionnaireData, value: string) => {
      dispatch({ type: "REMOVE_FROM_LIST", field, value });
    },
    [],
  );

  const getApiPayload = useCallback(
    (cancerTypes: string[], workoutSchedule?: WorkoutDaySummary[]) =>
      toNutritionApiPayload(data, cancerTypes, workoutSchedule),
    [data],
  );

  return { data, setField, toggleInList, addToList, removeFromList, getApiPayload };
}
