import { getUniverses, generateStory } from './api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('fetches universes successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ universes: ['Universe A', 'Universe B'] }),
        });

        const data = await getUniverses();
        expect(data.universes).toEqual(['Universe A', 'Universe B']);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/universes'));
    });

    it('generates story successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 123, story: 'Once upon a time...' }),
        });

        const result = await generateStory('Universe A', 'What if?', 'short');
        expect(result.id).toBe(123);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/story/generate'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"universe":"Universe A"'),
            })
        );
    });
});
