export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    upsert: jest.fn(() => Promise.resolve({ error: null })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
};
