import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-midnight text-white py-6">
      <div className="main-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full revolut-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">BL</span>
              </div>
              <span className="font-semibold text-md">Bank Loan Simulator</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              A demo application for simulating bank loans
            </p>
          </div>
          
          <div className="text-sm text-gray-300">
            <p>&copy; {currentYear} Bank Loan Simulator. All rights reserved.</p>
            <p className="mt-1">This is a demo application for internal use only.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer