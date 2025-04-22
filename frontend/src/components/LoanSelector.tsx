import React from 'react';

interface LoanSelectorProps {
  selectedType: 'home' | 'vehicle' | 'personal' | null;
  onSelectType: (type: 'home' | 'vehicle' | 'personal') => void;
}

const LoanSelector: React.FC<LoanSelectorProps> = ({ selectedType, onSelectType }) => {
  const loanTypes = [
    {
      id: 'home',
      title: 'Prêt Immobilier',
      description: 'Financez votre maison ou appartement avec des taux avantageux',
      icon: '🏠'
    },
    {
      id: 'vehicle',
      title: 'Prêt Automobile',
      description: 'Achetez votre véhicule neuf ou d\'occasion',
      icon: '🚗'
    },
    {
      id: 'personal',
      title: 'Prêt Personnel',
      description: 'Un financement pour tous vos projets personnels',
      icon: '💰'
    }
  ] as const;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-midnight mb-6">
        Quel type de prêt recherchez-vous ?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loanTypes.map(type => (
          <div 
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={`card cursor-pointer transition-all ${
              selectedType === type.id 
                ? 'border-2 border-electric-purple' 
                : 'border border-gray-200 hover:shadow-lg'
            }`}
          >
            <div className="text-4xl mb-4">{type.icon}</div>
            <h3 className="text-xl font-semibold text-midnight">{type.title}</h3>
            <p className="mt-2 text-charcoal">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanSelector;