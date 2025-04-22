import React from 'react';
import { useForm } from 'react-hook-form';
import { LoanProduct } from '../api/api';

interface LoanFormProps {
  product: LoanProduct;
  loanType: 'home' | 'vehicle' | 'personal';
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

interface FormData {
  loan_amount: number;
  loan_term_months: number;
  income: number;
  property_value?: number;
}

const LoanForm: React.FC<LoanFormProps> = ({ product, loanType, onSubmit, isLoading }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    trigger
  } = useForm<FormData>({
    defaultValues: {
      loan_amount: product.min_amount,
      loan_term_months: product.min_term_months,
      income: 0,
      property_value: loanType === 'personal' ? undefined : 0
    }
  });

  const watchedAmount = watch('loan_amount');
  const watchedTerm = watch('loan_term_months');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const requirePropertyValue = loanType === 'home' || loanType === 'vehicle';

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-midnight mb-6">
        Détails de votre prêt
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Montant du prêt */}
        <div>
          <label htmlFor="loan_amount" className="block text-sm font-medium text-charcoal mb-1">
            Montant du prêt
          </label>
          <div>
            <input
              type="range"
              id="loan_amount"
              min={product.min_amount}
              max={product.max_amount}
              step={1000}
              className="w-full h-2 bg-mist rounded-lg appearance-none cursor-pointer"
              {...register('loan_amount', {
                required: 'Ce champ est requis',
                min: {
                  value: product.min_amount,
                  message: `Le montant minimum est de ${formatCurrency(product.min_amount)}`
                },
                max: {
                  value: product.max_amount,
                  message: `Le montant maximum est de ${formatCurrency(product.max_amount)}`
                }
              })}
              onChange={() => trigger('loan_amount')}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>{formatCurrency(product.min_amount)}</span>
            <span className="font-medium">{formatCurrency(watchedAmount || 0)}</span>
            <span>{formatCurrency(product.max_amount)}</span>
          </div>
          {errors.loan_amount && (
            <p className="text-red-500 text-xs mt-1">{errors.loan_amount.message}</p>
          )}
        </div>

        {/* Durée du prêt */}
        <div>
          <label htmlFor="loan_term_months" className="block text-sm font-medium text-charcoal mb-1">
            Durée du prêt (mois)
          </label>
          <div>
            <input
              type="range"
              id="loan_term_months"
              min={product.min_term_months}
              max={product.max_term_months}
              step={loanType === 'home' ? 12 : 6}
              className="w-full h-2 bg-mist rounded-lg appearance-none cursor-pointer"
              {...register('loan_term_months', {
                required: 'Ce champ est requis',
                min: {
                  value: product.min_term_months,
                  message: `La durée minimum est de ${product.min_term_months} mois`
                },
                max: {
                  value: product.max_term_months,
                  message: `La durée maximum est de ${product.max_term_months} mois`
                }
              })}
              onChange={() => trigger('loan_term_months')}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>{product.min_term_months} mois</span>
            <span className="font-medium">{watchedTerm || 0} mois {watchedTerm && watchedTerm >= 12 ? `(${Math.floor(watchedTerm / 12)} ans)` : ''}</span>
            <span>{product.max_term_months} mois</span>
          </div>
          {errors.loan_term_months && (
            <p className="text-red-500 text-xs mt-1">{errors.loan_term_months.message}</p>
          )}
        </div>

        {/* Valeur du bien */}
        {requirePropertyValue && (
          <div>
            <label htmlFor="property_value" className="block text-sm font-medium text-charcoal mb-1">
              Valeur du {loanType === 'home' ? 'bien immobilier' : 'véhicule'} (€)
            </label>
            <input
              type="number"
              id="property_value"
              className="input-field"
              placeholder={loanType === 'home' ? "Valeur estimée du bien" : "Prix du véhicule"}
              {...register('property_value', {
                required: 'Ce champ est requis',
                min: {
                  value: 1,
                  message: 'Veuillez entrer une valeur valide'
                }
              })}
            />
            {errors.property_value && (
              <p className="text-red-500 text-xs mt-1">{errors.property_value.message}</p>
            )}
          </div>
        )}

        {/* Revenus mensuels */}
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-charcoal mb-1">
            Revenus annuels (€)
          </label>
          <input
            type="number"
            id="income"
            className="input-field"
            placeholder="Revenus annuels avant impôts"
            {...register('income', {
              required: 'Ce champ est requis',
              min: {
                value: 1,
                message: 'Veuillez entrer un montant valide'
              }
            })}
          />
          {errors.income && (
            <p className="text-red-500 text-xs mt-1">{errors.income.message}</p>
          )}
        </div>

        {/* Information sur le taux */}
        <div className="p-4 bg-mist bg-opacity-40 rounded-lg text-sm">
          <p className="font-medium text-midnight">
            Taux de base: {product.base_rate}%
          </p>
          <p className="mt-1 text-charcoal">
            Le taux final peut varier en fonction de votre profil de risque et des conditions du marché.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? 'Calcul en cours...' : 'Calculer mon prêt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;