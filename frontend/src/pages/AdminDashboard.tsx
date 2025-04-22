import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { api, LoanProduct, SimulationResult } from '../api/api';
import { useAuthStore } from '../utils/auth';

type ActiveTab = 'products' | 'simulations' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  
  const { logout } = useAuthStore();
  
  // Récupération des données
  const { 
    data: products = [], 
    refetch: refetchProducts,
    isLoading: isLoadingProducts 
  } = useQuery('adminProducts', api.getLoanProducts);
  
  const { 
    data: simulations = [], 
    refetch: refetchSimulations,
    isLoading: isLoadingSimulations 
  } = useQuery('adminSimulations', api.getSimulations);

  const handleDeleteProduct = async (id: number) => {
    try {
      await api.deleteLoanProduct(id);
      refetchProducts();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handlePurgeOldSimulations = async () => {
    try {
      const result = await api.purgeOldSimulations();
      alert(result.message);
      refetchSimulations();
    } catch (error) {
      console.error('Error purging simulations:', error);
    }
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatage monétaire
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="main-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-midnight">Administration</h1>
        <p className="text-charcoal mt-2">
          Gérez vos produits de prêt et consultez les simulations des utilisateurs
        </p>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'products' ? 'text-electric-purple border-b-2 border-electric-purple' : ''
          }`}
        >
          Produits de prêt
        </button>
        <button
          onClick={() => setActiveTab('simulations')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'simulations' ? 'text-electric-purple border-b-2 border-electric-purple' : ''
          }`}
        >
          Simulations
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-medium ${
            activeTab === 'settings' ? 'text-electric-purple border-b-2 border-electric-purple' : ''
          }`}
        >
          Paramètres
        </button>
      </div>
      
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Produits de prêt</h2>
            <button 
              className="btn-primary"
              onClick={() => {
                setSelectedProduct(null);
                setShowProductForm(true);
              }}
            >
              Ajouter un produit
            </button>
          </div>
          
          {isLoadingProducts ? (
            <div className="text-center py-8">Chargement des produits...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux de base</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Min-Max</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée (mois)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.type === 'home' ? 'Immobilier' : product.type === 'vehicle' ? 'Automobile' : 'Personnel'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.base_rate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.min_term_months} - {product.max_term_months}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.is_active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductForm(true);
                          }}
                          className="text-electric-purple hover:text-indigo mr-4"
                        >
                          Modifier
                        </button>
                        {showDeleteConfirm === product.id ? (
                          <>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 mr-2"
                            >
                              Confirmer
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* À implémenter: formulaire d'ajout/modification de produit */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {selectedProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                </h3>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setShowProductForm(false)}
                    className="btn-outline mr-4"
                  >
                    Annuler
                  </button>
                  <button className="btn-primary">
                    {selectedProduct ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'simulations' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Simulations des utilisateurs</h2>
            <button 
              onClick={handlePurgeOldSimulations}
              className="btn-outline text-sm"
            >
              Purger les anciennes données (RGPD)
            </button>
          </div>
          
          {isLoadingSimulations ? (
            <div className="text-center py-8">Chargement des simulations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensualité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulations.map((simulation) => (
                    <tr key={simulation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{simulation.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {simulation.loan_type === 'home' ? 'Immobilier' : simulation.loan_type === 'vehicle' ? 'Automobile' : 'Personnel'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(simulation.loan_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {simulation.loan_term_months} mois
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {simulation.interest_rate}% (TAEG: {simulation.apr.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(simulation.monthly_payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {simulation.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(simulation.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Paramètres</h2>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Compte administrateur</h3>
            
            <div className="mb-6">
              <button 
                onClick={logout}
                className="btn-primary"
              >
                Déconnexion
              </button>
            </div>
            
            <div className="p-4 bg-mist bg-opacity-40 rounded-lg">
              <p className="font-medium">Informations système</p>
              <p className="text-sm mt-1">Version de l'application: 1.0.0</p>
              <p className="text-sm mt-1">Bank Loan Simulator - Dashboard Administrateur</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;