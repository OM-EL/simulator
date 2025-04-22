import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate('/admin');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="main-container py-16">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-midnight mb-8 text-center">
            Connexion Administrateur
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-charcoal mb-1">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
          
          <div className="mt-6 text-sm text-center text-charcoal">
            <p>Informations de démonstration :</p>
            <p>Nom d'utilisateur: <strong>admin</strong></p>
            <p>Mot de passe: <strong>admin@123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;