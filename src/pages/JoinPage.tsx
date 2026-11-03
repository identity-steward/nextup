import { useNavigate } from 'react-router-dom';
import CreateAthletePage from './CreateAthletePage';

export function JoinPage() {
  const navigate = useNavigate();
  return <CreateAthletePage onNavigate={(page) => navigate(page === 'athletes' ? '/youth' : '/start')} />;
}
