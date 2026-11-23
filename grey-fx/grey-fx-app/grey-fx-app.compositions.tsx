import { MemoryRouter } from 'react-router-dom';
import { GreyFxApp } from './grey-fx-app.js';

/** The full GREY FX app starting on the village intro. */
export const GreyFxAppBasic = () => {
  return (
    <MemoryRouter>
      <GreyFxApp />
    </MemoryRouter>
  );
};
