import React from 'react';
import renderer from 'react-test-renderer';
import Home from './(tabs)/index';

// Mocks
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../lib/api', () => ({
    getUniverses: jest.fn(() => Promise.resolve({ universes: ['Test Universe'] })),
}));

describe('<Home />', () => {
    it('renders correctly', () => {
        const tree = renderer.create(<Home />).toJSON();
        expect(tree).toBeDefined();
        // Snapshot testing or checking child count could be added here
    });

    // Note: Detailed interaction testing would typically use @testing-library/react-native
    // but simple rendering verification is sufficient for basic check.
});
