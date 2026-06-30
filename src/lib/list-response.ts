function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getListItems<T>(result: unknown): T[] {
  if (!result) {
    return [];
  }

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (!isRecord(result)) {
    return [];
  }

  const data = result.data;

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as T[];
  }

  const listKeys = ['tickets', 'items', 'content', 'results'] as const;

  for (const key of listKeys) {
    if (Array.isArray(result[key])) {
      return result[key] as T[];
    }
  }

  return [];
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export function toPaginatedResponse<T>(
  result: unknown,
  fallback: { page?: number; limit?: number } = {},
): { data: T[]; total: number; page: number; limit: number } {
  const data = getListItems<T>(result);

  if (!isRecord(result)) {
    return {
      data,
      total: data.length,
      page: fallback.page ?? DEFAULT_PAGE,
      limit: fallback.limit ?? DEFAULT_LIMIT,
    };
  }

  const nested = isRecord(result.data) ? result.data : result;

  return {
    data,
    total: typeof nested.total === 'number' ? nested.total : data.length,
    page: typeof nested.page === 'number' ? nested.page : (fallback.page ?? DEFAULT_PAGE),
    limit: typeof nested.limit === 'number' ? nested.limit : (fallback.limit ?? DEFAULT_LIMIT),
  };
}
