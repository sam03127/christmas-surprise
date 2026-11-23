import { ALL_SCENES, HttpError } from './surprise-service.js';

describe('surprise service', () => {
  it('exposes all experience scenes including the finale and maps HTTP errors', () => {
    expect(ALL_SCENES).toContain('finale');
    expect(new HttpError(404, 'x').status).toBe(404);
  });
});
