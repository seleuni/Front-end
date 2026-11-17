import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ArchiveProvider } from './context/ArchiveContext';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { CharactersPage } from './pages/CharactersPage';
import { CheckpointsPage } from './pages/CheckpointsPage';
import { MainPage } from './pages/MainPage';
import { PairingDetailPage } from './pages/PairingDetailPage';
import { PairingsPage } from './pages/PairingsPage';

export default function App() {
  return (
    <ArchiveProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/:id" element={<CharacterDetailPage />} />
            <Route path="/checkpoints" element={<CheckpointsPage />} />
            <Route path="/couple" element={<PairingsPage />} />
            <Route path="/couple/:id" element={<PairingDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ArchiveProvider>
  );
}
