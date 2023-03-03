export type LimitParameterName = 'first' | 'last';
export type CursorParameterName = 'after' | 'before';
export type QueryVariables = Record<string, number | string | boolean>;
export type Paginator = {
  path: string[];
  limitVarName: string;
  cursorVarName: string;
  done?: boolean;
}

export function isLimitParameter(name: string): name is LimitParameterName {
  return name === 'first' || name === 'last';
}

export function isCursorParameter(name: string): name is CursorParameterName {
  return name === 'after' || name === 'before';
}