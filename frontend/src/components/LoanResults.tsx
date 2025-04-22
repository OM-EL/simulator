import React, { useState } from 'react';
import { SimulationResult } from '../api/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

interface LoanResultsProps {
  result: SimulationResult;
  onSendEmail: (email: string) => void;
  onReset: () => void;
  isLoading: boolean;
  emailSent: boolean;
  emailAddress: string;
}

const LoanResults: React.FC<LoanResultsProps> = ({ 
  result, 
  onSendEmail, 
  onReset, 
  isLoading,
  emailSent,
  emailAddress 
}) => {
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'amortization' | 'charts'>('summary');
  
  // Format des nombres en euros
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Données pour le graphique d'amortissement
  const chartData = result.amortization.filter((entry, index) => {
    // Pour éviter d'avoir trop de points sur le graphique, on ne prend que certains points
    if (result.loan_term_months <= 60) return true; // tous les mois pour ≤ 5 ans
    if (result.loan_term_months <= 120) return index % 3 === 0; // tous les 3 mois pour ≤ 10 ans
    if (result.loan_term_months <= 240) return index % 6 === 0; // tous les 6 mois pour ≤ 20 ans
    return index % 12 === 0; // tous les ans pour > 20 ans
  });

  // Données pour le graphique en camembert
  const pieData = [
    { name: 'Principal', value: result.loan_amount },
    { name: 'Intérêts', value: result.total_interest }
  ];
  const COLORS = ['#6E4CE5', '#81B2F1'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-electric-purple text-white p-6">
        <h2 className="text-2xl font-bold">Résultat de votre simulation de prêt</h2>
        <p className="mt-2 text-sky-blue">
          Détails complets de votre {
            result.loan_type === 'home' 
              ? 'prêt immobilier' 
              : result.loan_type === 'vehicle' 
                ? 'prêt automobile' 
                : 'prêt personnel'
          }
        </p>
      </div>
      
      <div className="p-6">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'summary' 
                ? 'text-electric-purple border-b-2 border-electric-purple' 
                : 'text-charcoal'
            }`}
          >
            Résumé
          </button>
          <button 
            onClick={() => setActiveTab('amortization')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'amortization' 
                ? 'text-electric-purple border-b-2 border-electric-purple' 
                : 'text-charcoal'
            }`}
          >
            Tableau d'amortissement
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'charts' 
                ? 'text-electric-purple border-b-2 border-electric-purple' 
                : 'text-charcoal'
            }`}
          >
            Graphiques
          </button>
        </div>
        
        <div className="py-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">Montant du prêt</p>
                    <p className="text-2xl font-bold text-midnight">{formatCurrency(result.loan_amount)}</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">Taux d'intérêt</p>
                    <p className="text-2xl font-bold text-midnight">{result.interest_rate}%</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">Durée du prêt</p>
                    <p className="text-2xl font-bold text-midnight">
                      {result.loan_term_months} mois 
                      {result.loan_term_months >= 12 && ` (${Math.floor(result.loan_term_months / 12)} ans)`}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">Mensualité</p>
                    <p className="text-3xl font-bold text-electric-purple">{formatCurrency(result.monthly_payment)}</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">Coût total du crédit</p>
                    <p className="text-2xl font-bold text-midnight">{formatCurrency(result.total_interest)}</p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-charcoal mb-1">TAEG</p>
                    <p className="text-2xl font-bold text-midnight">{result.apr.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              {result.ltv_ratio !== null && (
                <div className="p-4 bg-mist bg-opacity-40 rounded-lg">
                  <p className="font-medium">
                    Ratio prêt-valeur (LTV): {result.ltv_ratio.toFixed(2)}%
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-mist bg-opacity-40 rounded-lg">
                <p className="font-medium">
                  Ratio dette-revenus (DTI): {result.dti_ratio.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'amortization' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensualité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intérêts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital restant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.amortization.map((entry) => (
                    <tr key={entry.month} className={entry.month % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.payment)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.principal)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.interest)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(entry.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'charts' && (
            <div className="space-y-8">
              <div className="h-80">
                <h4 className="text-lg font-medium text-midnight mb-4">Évolution du capital restant</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" name="Mois" />
                    <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => `Mois: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      name="Capital restant" 
                      stroke="#6E4CE5" 
                      fill="#6E4CE5" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-80">
                <h4 className="text-lg font-medium text-midnight mb-4">Répartition du coût total</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          {!emailSent ? (
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                className="input-field md:flex-1"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn-primary"
                disabled={isLoading || !email}
                onClick={() => email && onSendEmail(email)}
              >
                {isLoading ? 'Envoi en cours...' : 'Recevoir par email'}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              <p className="font-medium">
                Simulation envoyée avec succès à {emailAddress}
              </p>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <button
              className="btn-outline"
              onClick={onReset}
            >
              Nouvelle simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanResults;