import axios from 'axios';

// Types
export interface LoanProduct {
  id: number;
  name: string;
  type: 'home' | 'vehicle' | 'personal';
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  base_rate: number;
  max_ltv: number | null;
  max_dti: number;
  origination_fee_percent: number;
  risk_bands: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SimulationRequest {
  product_id: number;
  loan_type: 'home' | 'vehicle' | 'personal';
  loan_amount: number;
  loan_term_months: number;
  income: number;
  property_value?: number;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface SimulationResult {
  id: number;
  loan_type: string;
  loan_amount: number;
  loan_term_months: number;
  interest_rate: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  apr: number;
  ltv_ratio: number | null;
  dti_ratio: number;
  amortization: AmortizationEntry[];
  created_at: string;
}

// Configuration axios avec le préfixe API
axios.defaults.baseURL = '/api';

// API endpoints
export const api = {
  // Loan Products
  getLoanProducts: async (): Promise<LoanProduct[]> => {
    const response = await axios.get('/loan-products/');
    return response.data;
  },

  getLoanProduct: async (id: number): Promise<LoanProduct> => {
    const response = await axios.get(`/loan-products/${id}`);
    return response.data;
  },

  createLoanProduct: async (product: Omit<LoanProduct, 'id' | 'created_at' | 'updated_at'>): Promise<LoanProduct> => {
    const response = await axios.post('/loan-products/', product);
    return response.data;
  },

  updateLoanProduct: async (id: number, product: Partial<LoanProduct>): Promise<LoanProduct> => {
    const response = await axios.put(`/loan-products/${id}`, product);
    return response.data;
  },

  deleteLoanProduct: async (id: number): Promise<void> => {
    await axios.delete(`/loan-products/${id}`);
  },

  // Simulations
  createSimulation: async (data: SimulationRequest): Promise<SimulationResult> => {
    const response = await axios.post('/simulations/', data);
    return response.data;
  },

  getSimulations: async (): Promise<SimulationResult[]> => {
    const response = await axios.get('/simulations/');
    return response.data;
  },

  emailSimulation: async (simulationId: number, email: string): Promise<{ message: string, email: string }> => {
    const response = await axios.post(`/simulations/${simulationId}/email`, { simulation_id: simulationId, email });
    return response.data;
  },

  purgeOldSimulations: async (): Promise<{ message: string }> => {
    const response = await axios.delete('/simulations/purge-gdpr');
    return response.data;
  },

  // Authentication
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post('/token', formData);
    return response.data;
  }
};