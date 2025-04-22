# Bank Loan Simulator

## Description
The Bank Loan Simulator is a Revolut-style demo application designed to simulate Home, Vehicle, and Personal loans. It provides an interactive user experience for prospects to calculate loan details and for administrators to manage loan products and leads. The application is optimized for offline demos and styled to match Revolut's visual identity.

## Features
- **Loan Simulations**: Calculate payments, APR, and view amortization charts for different loan types.
- **Admin Dashboard**: Manage loan products, view leads, and export data.
- **Responsive Design**: Styled using Revolut's design system for a professional look and feel.
- **Email Integration**: Send loan quotes via email.
- **GDPR Compliance**: Automatic data purging after 90 days.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLite
- **State Management**: React Query
- **Authentication**: JWT
- **Email**: SendGrid or mock SMTP
- **Dev Tools**: Docker, Docker Compose

## Visual Identity
- **Primary Color**: Electric Purple (#6E4CE5)
- **Accent Color**: Sky Blue (#81B2F1)
- **Dark UI Base**: Midnight (#261073), Indigo (#2C1385)
- **Text/Contrast**: Charcoal (#39343B)
- **Background**: Mist (#CFB9C4)
- **Font**: Aeonik Pro (fallback: Inter, system-ui)

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Steps
1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Optional: Run with Docker**:
   ```bash
   docker-compose up --build
   ```

## Future Enhancements
- PDF quote generation
- OAuth sign-in
- Dark mode toggle
- CSV export of simulations and leads
- Real-time API analytics

## License
This project is built for internal demo purposes and is not intended for production use.