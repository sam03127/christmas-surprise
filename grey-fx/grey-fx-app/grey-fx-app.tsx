import { Routes, Route } from 'react-router-dom';
import './styles/theme.css';
import { HomePage } from './pages/home-page.js';
import { SurprisePage } from './pages/surprise-page.js';
import { CreatorPage } from './dashboard/creator-page.js';
import { PublishedPage } from './dashboard/published-page.js';
import { MySurprisesPage } from './dashboard/my-surprises-page.js';
import { CursorSparkles } from './ui/cursor-sparkles.js';

/**
 * GREY FX — Christmas Digital Surprise. Thin router composing the pages.
 */
export function GreyFxApp() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<MySurprisesPage />} />
        <Route path="/create/:id" element={<CreatorPage />} />
        <Route path="/create/:id/published" element={<PublishedPage />} />
        <Route path="/preview/:id" element={<SurprisePage preview />} />
        <Route path="/surprise/:id" element={<SurprisePage />} />
        <Route path="*" element={<SurprisePage />} />
      </Routes>
      <CursorSparkles />
    </>
  );
}
