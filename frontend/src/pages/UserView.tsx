import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { api, LoanProduct, SimulationResult, SimulationRequest } from '../api/api';
import LoanSelector from '../components/LoanSelector';
import LoanForm from '../components/LoanForm';
import LoanResults from '../components/LoanResults';

const UserView: React.FC = () => {
  const [selectedLoanType, setSelectedLoanType] = useState<'home' | 'vehicle' | 'personal' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Charger tous les produits de prêt
  const { data: loanProducts = [] } = useQuery('loanProducts', api.getLoanProducts);

  // Filtrer les produits par type
  const filteredProducts = loanProducts.filter(product => 
    selectedLoanType ? product.type === selectedLoanType : true
  );

  const handleLoanTypeSelect = (type: 'home' | 'vehicle' | 'personal') => {
    setSelectedLoanType(type);
    setSelectedProduct(null);
    setSimulationResult(null);
    setEmailSent(false);
  };

  const handleProductSelect = (product: LoanProduct) => {
    setSelectedProduct(product);
    setSimulationResult(null);
    setEmailSent(false);
  };

  const handleSimulationSubmit = async (formData: Omit<SimulationRequest, 'product_id' | 'loan_type'>) => {
    if (!selectedProduct || !selectedLoanType) return;
    
    setIsLoading(true);
    try {
      const simulationRequest: SimulationRequest = {
        ...formData,
        product_id: selectedProduct.id,
        loan_type: selectedLoanType
      };
      
      const result = await api.createSimulation(simulationRequest);
      setSimulationResult(result);
    } catch (error) {
      console.error("Simulation error:", error);
      // Gérer l'erreur ici
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (email: string) => {
    if (!simulationResult) return;
    
    setIsLoading(true);
    try {
      await api.emailSimulation(simulationResult.id, email);
      setEmailSent(true);
      setEmailAddress(email);
    } catch (error) {
      console.error("Email sending error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedLoanType(null);
    setSelectedProduct(null);
    setSimulationResult(null);
    setEmailSent(false);
    setEmailAddress('');
  };

  return (
    <div className="main-container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-electric-purple mb-4">Bank Loan Simulator</h1>
        <p className="text-xl text-charcoal max-w-3xl mx-auto">
          Simulez votre prêt immobilier, automobile ou personnel en quelques étapes simples et recevez une estimation détaillée de votre financement.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!simulationResult ? (
          <>
            <LoanSelector 
              selectedType={selectedLoanType}
              onSelectType={handleLoanTypeSelect}
            />
            
            {selectedLoanType && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-midnight mb-6">
                  Choisissez votre produit de prêt
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`card cursor-pointer transition-all ${
                        selectedProduct?.id === product.id 
                          ? 'border-2 border-electric-purple' 
                          : 'border border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      <h3 className="text-xl font-semibold text-midnight">{product.name}</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span>Taux de base:</span>
                          <span className="font-medium">{product.base_rate}%</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Montant:</span>
                          <span className="font-medium">${product.min_amount.toLocaleString()} - ${product.max_amount.toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Durée:</span>
                          <span className="font-medium">{product.min_term_months} - {product.max_term_months} mois</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Frais d'origine:</span>
                          <span className="font-medium">{product.origination_fee_percent}%</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedProduct && (
              <div className="mt-10">
                <LoanForm 
                  product={selectedProduct}
                  loanType={selectedLoanType!}
                  onSubmit={handleSimulationSubmit}
                  isLoading={isLoading}
                />
              </div>
            )}
          </>
        ) : (
          <LoanResults 
            result={simulationResult}
            onSendEmail={handleSendEmail}
            onReset={handleReset}
            isLoading={isLoading}
            emailSent={emailSent}
            emailAddress={emailAddress}
          />
        )}
      </div>
    </div>
  );
};

export default UserView;